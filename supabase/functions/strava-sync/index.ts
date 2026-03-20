// Supabase Edge Function: strava-sync
// Imports activities from Strava and stores them in the workouts table
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sportMap: Record<string, string> = {
  Swim: "swim", VirtualSwim: "swim",
  Ride: "bike", VirtualRide: "bike", EBikeRide: "bike",
  Run: "run",  VirtualRun: "run",  TrailRun: "run",
  WeightTraining: "strength", Workout: "strength",
  Yoga: "rest", Rest: "rest",
};

function formatPace(paceSeconds: number | null): string | null {
  if (!paceSeconds) return null;
  const m = Math.floor(paceSeconds / 60);
  const s = String(paceSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

async function refreshTokenIfNeeded(
  supabase: ReturnType<typeof createClient>,
  tokenRow: { access_token: string; refresh_token: string; expires_at: number; user_id: string }
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (tokenRow.expires_at > now + 300) return tokenRow.access_token;

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Deno.env.get("STRAVA_CLIENT_ID"),
      client_secret: Deno.env.get("STRAVA_CLIENT_SECRET"),
      refresh_token: tokenRow.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Token refresh failed");
  const data = await res.json();

  await supabase.from("strava_tokens").update({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    updated_at: new Date().toISOString(),
  }).eq("user_id", tokenRow.user_id);

  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("Missing userId");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokenRow, error: tokenError } = await supabase
      .from("strava_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (tokenError || !tokenRow) throw new Error("Strava не подключена. Сначала подключите Strava в настройках.");

    const accessToken = await refreshTokenIfNeeded(supabase, tokenRow);

    // Fetch last 365 days of activities
    const after = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);
    let page = 1;
    let imported = 0;

    // Load existing strava_ids to avoid duplicates without needing a unique constraint
    const { data: existing } = await supabase
      .from("workouts")
      .select("strava_id")
      .eq("user_id", userId)
      .not("strava_id", "is", null);

    const existingIds = new Set((existing || []).map((r: { strava_id: number }) => String(r.strava_id)));

    let stravaFetched = 0;
    let skipped = 0;
    let insertErrors: string[] = [];
    let stravaApiError: string | null = null;

    while (true) {
      const res = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50&page=${page}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        stravaApiError = `Strava API error: ${res.status} ${await res.text()}`;
        break;
      }
      const activities = await res.json();
      if (!activities.length) break;

      stravaFetched += activities.length;

      for (const act of activities) {
        // Skip already imported activities (compare as string to avoid bigint mismatch)
        if (existingIds.has(String(act.id))) { skipped++; continue; }

        const sport = sportMap[act.type] || "run";
        const durationMin = Math.round((act.moving_time || 0) / 60);
        const distanceKm = act.distance ? Math.round(act.distance / 10) / 100 : null;
        const paceSeconds = act.distance > 0
          ? Math.round(act.moving_time / (act.distance / 1000))
          : null;
        const dateStr = (act.start_date_local || act.start_date || '').slice(0, 10);

        const { error } = await supabase.from("workouts").insert({
          user_id: userId,
          strava_id: act.id,
          title: act.name,
          sport,
          date: dateStr,
          duration: durationMin,
          distance: distanceKm,
          avg_hr: act.average_heartrate ? Math.round(act.average_heartrate) : null,
          max_hr: act.max_heartrate ? Math.round(act.max_heartrate) : null,
          avg_pace: formatPace(paceSeconds),
          calories: act.calories ? Math.round(act.calories) : null,
          source: "strava",
        });

        if (!error) {
          imported++;
          existingIds.add(String(act.id));
        } else {
          insertErrors.push(`${act.id}: ${error.message}`);
        }
      }

      if (activities.length < 50) break;
      page++;
    }

    await supabase.from("strava_tokens").update({
      last_sync_at: new Date().toISOString(),
      activities_count: (tokenRow.activities_count || 0) + imported,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);

    return new Response(JSON.stringify({
      success: true,
      imported,
      stravaFetched,
      skipped,
      insertErrors,
      stravaApiError,
      existingCount: existingIds.size,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
