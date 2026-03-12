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
  oauthToken?: string,
  oauthTokenSecret?: string,
  extraParams: Record<string, string> = {}
): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = generateNonce();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_version: "1.0",
    ...extraParams,
  };
  if (oauthToken) oauthParams["oauth_token"] = oauthToken;

  // Build signature base string
  const allParams = { ...oauthParams };
  const sortedParams = Object.keys(allParams).sort().map(k =>
    `${percentEncode(k)}=${percentEncode(allParams[k])}`
  ).join("&");

  const baseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join("&");

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(oauthTokenSecret || "")}`;
  const signature = await hmacSha1(signingKey, baseString);
  oauthParams["oauth_signature"] = signature;

  const headerValue = "OAuth " + Object.keys(oauthParams).sort().map(k =>
    `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`
  ).join(", ");

  return headerValue;
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
    const { action, userId, oauth_token, oauth_verifier } = await req.json();

    // ── Step 1: Get request token ──────────────────────────────────────────────
    if (action === "request_token") {
      if (!CONSUMER_KEY) {
        return new Response(
          JSON.stringify({ error: "GARMIN_CONSUMER_KEY не настроен. Подайте заявку на developer.garmin.com и добавьте ключи в Supabase Secrets." }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      const requestTokenUrl = "https://connectapi.garmin.com/oauth-service/oauth/request_token";
      const callbackUrl = `${req.headers.get("origin") || "https://trilink-app.netlify.app"}/auth/garmin/callback`;

      const authHeader = await buildOAuthHeader(
        "POST", requestTokenUrl, CONSUMER_KEY, CONSUMER_SECRET, undefined, undefined,
        { oauth_callback: callbackUrl }
      );

      const response = await fetch(requestTokenUrl, {
        method: "POST",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Garmin request_token failed: ${response.status} ${text}`);
      }

      const body = await response.text();
      const params = new URLSearchParams(body);
      const reqToken = params.get("oauth_token");
      const reqTokenSecret = params.get("oauth_token_secret");

      if (!reqToken) throw new Error("Не получен oauth_token от Garmin");

      // Temporarily store request token secret (keyed by oauth_token) so we can
      // retrieve it in the access_token step. We store it in garmin_tokens as a
      // pending row.
      await supabase.from("garmin_tokens").upsert({
        user_id: userId,
        oauth_token: reqToken,
        oauth_token_secret: reqTokenSecret || "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({ oauth_token: reqToken }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ── Step 2: Exchange for access token ──────────────────────────────────────
    if (action === "access_token") {
      if (!CONSUMER_KEY) {
        return new Response(
          JSON.stringify({ error: "GARMIN_CONSUMER_KEY не настроен" }),
          { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
        );
      }

      // Retrieve request token secret we stored in step 1
      const { data: stored } = await supabase
        .from("garmin_tokens")
        .select("oauth_token_secret")
        .eq("user_id", userId)
        .maybeSingle();

      const requestTokenSecret = stored?.oauth_token_secret || "";

      const accessTokenUrl = "https://connectapi.garmin.com/oauth-service/oauth/access_token";
      const authHeader = await buildOAuthHeader(
        "POST", accessTokenUrl, CONSUMER_KEY, CONSUMER_SECRET,
        oauth_token, requestTokenSecret,
        { oauth_verifier }
      );

      const response = await fetch(accessTokenUrl, {
        method: "POST",
        headers: { Authorization: authHeader },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Garmin access_token failed: ${response.status} ${text}`);
      }

      const body = await response.text();
      const params = new URLSearchParams(body);
      const accessToken = params.get("oauth_token");
      const accessTokenSecret = params.get("oauth_token_secret");
      const garminUserId = params.get("oauth_token")?.split("|")[0] || null;

      if (!accessToken) throw new Error("Не получен access token от Garmin");

      // Fetch user profile for display name
      let displayName: string | null = null;
      try {
        const profileUrl = "https://connect.garmin.com/modern/proxy/userprofile-service/socialProfile";
        const profileAuth = await buildOAuthHeader(
          "GET", profileUrl, CONSUMER_KEY, CONSUMER_SECRET, accessToken, accessTokenSecret || ""
        );
        const profileRes = await fetch(profileUrl, { headers: { Authorization: profileAuth } });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          displayName = profile.displayName || profile.fullName || null;
        }
      } catch {
        // Display name is optional
      }

      // Save permanent access token
      await supabase.from("garmin_tokens").upsert({
        user_id: userId,
        oauth_token: accessToken,
        oauth_token_secret: accessTokenSecret || "",
        garmin_user_id: garminUserId,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({ success: true, display_name: displayName }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
