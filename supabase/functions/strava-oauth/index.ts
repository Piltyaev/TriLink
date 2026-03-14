// Supabase Edge Function: strava-oauth
// Exchanges Strava OAuth code for access + refresh tokens and saves to DB
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("[strava-oauth] invoked");
    const { code, userId } = await req.json();
    if (!code || !userId) throw new Error("Missing code or userId");
    console.log("[strava-oauth] code received for userId:", userId);

    const clientId = Deno.env.get("STRAVA_CLIENT_ID");
    const clientSecret = Deno.env.get("STRAVA_CLIENT_SECRET");
    if (!clientId || !clientSecret) throw new Error("STRAVA_CLIENT_ID or STRAVA_CLIENT_SECRET not set");
    console.log("[strava-oauth] secrets OK, clientId:", clientId);

    // Exchange code for tokens with Strava
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("[strava-oauth] Strava token response status:", tokenRes.status, "body:", JSON.stringify(tokenData));

    if (!tokenRes.ok) {
      // Parse Strava error response and return a clean error code
      const stravaErrors: { code?: string }[] = tokenData?.errors ?? [];
      const hasQuotaError = stravaErrors.some(
        (e) => (e.code ?? "").toLowerCase().includes("too many") || (e.code ?? "").toLowerCase().includes("athlete")
      ) || (tokenData?.message ?? "").toLowerCase().includes("too many");

      if (hasQuotaError) {
        return new Response(
          JSON.stringify({ error: "too_many_athletes" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(tokenData?.message ?? `Strava token exchange failed (${tokenRes.status})`);
    }

    if (!tokenData.access_token) {
      throw new Error("No access token returned by Strava");
    }

    // Save tokens to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertError } = await supabase.from("strava_tokens").upsert({
      user_id: userId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      athlete_id: tokenData.athlete?.id ?? null,
      athlete_name: `${tokenData.athlete?.firstname ?? ""} ${tokenData.athlete?.lastname ?? ""}`.trim() || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
