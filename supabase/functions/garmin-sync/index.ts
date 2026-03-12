import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── OAuth 1.0a Helpers ───────────────────────────────────────────────────────

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}

function generateNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function hmacSha1(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw", encoder.encode(key), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function buildOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  oauthToken: string,
  oauthTokenSecret: string,
  queryParams: Record<string, string> = {}
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: oauthToken,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...queryParams };
  const sortedParams = Object.keys(allParams).sort().map(k =>
    `${percentEncode(k)}=${percentEncode(allParams[k])}`
  ).join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&");

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(oauthTokenSecret)}`;
  const signature = await hmacSha1(signingKey, baseString);
  oauthParams["oauth_signature"] = signature;

  return "OAuth " + Object.keys(oauthParams).sort().map(k =>
    `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`
  ).join(", ");
}

// ─── Activity Type Mapping ─────────────────────────────────────────────────────

const activityTypeMap: Record<string, string> = {
  swimming: "swim",
  lap_swimming: "swim",
  open_water_swimming: "swim",
  cycling: "bike",
  road_biking: "bike",
  mountain_biking: "bike",
  indoor_cycling: "bike",
  virtual_ride: "bike",
  running: "run",
  trail_running: "run",
  treadmill_running: "run",
  strength_training: "strength",
  weight_training: "strength",
  rest: "rest",
  recovery: "rest",
};

function mapActivityType(garminType: string): string {
  const key = garminType.toLowerCase().replace(/\s+/g, "_");
  return activityTypeMap[key] || "run";
}

function formatPace(speedMs: number): string | null {
  if (!speedMs || speedMs <= 0) return null;
  const secPerKm = 1000 / speedMs;
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const CONSUMER_KEY = Deno.env.get("GARMIN_CONSUMER_KEY") || "";
  const CONSUMER_SECRET = Deno.env.get("GARMIN_CONSUMER_SECRET") || "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("userId required");

    if (!CONSUMER_KEY) {
      throw new Error("GARMIN_CONSUMER_KEY не настроен. Добавьте ключи в Supabase Secrets.");
    }

    // Load stored tokens
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("garmin_tokens")
      .select("oauth_token, oauth_token_secret, garmin_user_id")
      .eq("user_id", userId)
      .single();

    if (tokenErr || !tokenRow) throw new Error("Garmin не подключён");

    const { oauth_token, oauth_token_secret, garmin_user_id } = tokenRow;

    // Fetch activities from last 90 days
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const startTime = Math.floor(since.getTime() / 1000);

    const baseUrl = "https://healthapi.garmin.com/wellness-api/rest/activities";
    const queryParams = { uploadStartTimeInSeconds: startTime.toString(), uploadEndTimeInSeconds: Math.floor(Date.now() / 1000).toString() };

    const authHeader = await buildOAuthHeader(
      "GET", baseUrl, CONSUMER_KEY, CONSUMER_SECRET,
      oauth_token, oauth_token_secret, queryParams
    );

    const queryString = new URLSearchParams(queryParams).toString();
    const activitiesRes = await fetch(`${baseUrl}?${queryString}`, {
      headers: { Authorization: authHeader },
    });

    if (!activitiesRes.ok) {
      const text = await activitiesRes.text();
      throw new Error(`Garmin API error: ${activitiesRes.status} ${text}`);
    }

    const activitiesData = await activitiesRes.json();
    const activities = activitiesData.activities || activitiesData || [];

    let imported = 0;

    for (const act of activities) {
      const activityId = act.activityId || act.summaryId;
      if (!activityId) continue;

      const sport = mapActivityType(act.activityType || "");
      const durationMin = Math.round((act.durationInSeconds || act.movingDurationInSeconds || 0) / 60);
      if (durationMin <= 0) continue;

      const distanceKm = act.distanceInMeters
        ? Math.round(act.distanceInMeters / 10) / 100
        : null;

      const avgSpeedMs = act.averageSpeedInMetersPerSecond || 0;
      const avgPace = (sport === "run" || sport === "swim") ? formatPace(avgSpeedMs) : null;

      const actDate = act.startTimeInSeconds
        ? new Date(act.startTimeInSeconds * 1000).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const name = act.activityName || act.activityType || "Тренировка Garmin";

      const { error: upsertErr } = await supabase.from("workouts").upsert({
        user_id: userId,
        garmin_activity_id: activityId,
        title: name,
        sport,
        date: actDate,
        duration: durationMin,
        distance: distanceKm,
        avg_hr: act.averageHeartRateInBeatsPerMinute || null,
        max_hr: act.maxHeartRateInBeatsPerMinute || null,
        avg_pace: avgPace,
        calories: act.activeKilocalories || act.totalKilocalories || null,
        source: "garmin",
      }, { onConflict: "garmin_activity_id" });

      if (!upsertErr) imported++;
    }

    // Update sync metadata
    await supabase.from("garmin_tokens").update({
      last_sync_at: new Date().toISOString(),
      activities_count: imported,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, imported }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
