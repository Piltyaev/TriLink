// Supabase Edge Function: strava-webhook
// Receives Strava webhook events and auto-imports new activities
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

serve(async (req) => {
  const VERIFY_TOKEN = Deno.env.get("STRAVA_WEBHOOK_VERIFY_TOKEN") || "trilink_webhook";

  // ── Strava webhook verification (GET) ─────────────────────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode      = url.searchParams.get("hub.mode");
    const challenge = url.searchParams.get("hub.challenge");
    const token     = url.searchParams.get("hub.verify_token");

    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      return new Response(JSON.stringify({ "hub.challenge": challenge }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // ── Strava webhook event (POST) ────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const event = await req.json();

      // Only handle new activity creation
      if (event.object_type !== "activity" || event.aspect_type !== "create") {
        return new Response("ok", { status: 200 });
      }

      const stravaActivityId = event.object_id;
      const stravaAthleteId  = event.owner_id;

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Find user by athlete_id
      const { data: tokenRow } = await supabase
        .from("strava_tokens")
        .select("*")
        .eq("athlete_id", stravaAthleteId)
        .single();

      if (!tokenRow) return new Response("ok", { status: 200 });

      // Refresh token if needed
      const now = Math.floor(Date.now() / 1000);
      let accessToken = tokenRow.access_token;
      if (tokenRow.expires_at <= now + 300) {
        const res = await fetch("https://www.strava.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id:     Deno.env.get("STRAVA_CLIENT_ID"),
            client_secret: Deno.env.get("STRAVA_CLIENT_SECRET"),
            refresh_token: tokenRow.refresh_token,
            grant_type:    "refresh_token",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          accessToken = data.access_token;
          await supabase.from("strava_tokens").update({
            access_token:  data.access_token,
            refresh_token: data.refresh_token,
            expires_at:    data.expires_at,
            updated_at:    new Date().toISOString(),
          }).eq("user_id", tokenRow.user_id);
        }
      }

      // Check if activity already exists
      const { data: existing } = await supabase
        .from("workouts")
        .select("id")
        .eq("strava_id", stravaActivityId)
        .eq("user_id", tokenRow.user_id)
        .single();

      if (existing) return new Response("ok", { status: 200 });

      // Fetch activity details from Strava
      const actRes = await fetch(
        `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!actRes.ok) return new Response("ok", { status: 200 });
      const act = await actRes.json();

      const sport      = sportMap[act.type] || "run";
      const durationMin = Math.round((act.moving_time || 0) / 60);
      const distanceKm  = act.distance ? Math.round(act.distance / 10) / 100 : null;
      const paceSeconds = act.distance > 0
        ? Math.round(act.moving_time / (act.distance / 1000))
        : null;
      const dateStr = (act.start_date_local || act.start_date || '').slice(0, 10);

      await supabase.from("workouts").insert({
        user_id:  tokenRow.user_id,
        strava_id: act.id,
        title:    act.name,
        sport,
        date:     dateStr,
        duration: durationMin,
        distance: distanceKm,
        avg_hr:   act.average_heartrate ? Math.round(act.average_heartrate) : null,
        max_hr:   act.max_heartrate     ? Math.round(act.max_heartrate)     : null,
        avg_pace: formatPace(paceSeconds),
        calories: act.calories          ? Math.round(act.calories)          : null,
        source:   "strava",
      });

      return new Response("ok", { status: 200 });
    } catch {
      return new Response("ok", { status: 200 }); // always 200 to Strava
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
