import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Re-sync at most once per hour per session
const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export function useStravaAutoSync() {
  const { user } = useAuth();
  const didSync = useRef(false);

  useEffect(() => {
    if (!user || didSync.current) return;
    didSync.current = true;

    const run = async () => {
      try {
        // Check whether Strava is connected and when it was last synced
        const { data } = await supabase
          .from("strava_tokens")
          .select("last_sync_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!data) return; // Strava not connected — nothing to do

        const lastSync = data.last_sync_at
          ? new Date(data.last_sync_at).getTime()
          : 0;

        if (Date.now() - lastSync < SYNC_INTERVAL_MS) return; // synced recently

        // Fire sync silently in the background
        const { data: result, error } = await supabase.functions.invoke(
          "strava-sync",
          { body: { userId: user.id } }
        );

        if (!error && result?.imported > 0) {
          toast.success(
            `Strava: импортировано ${result.imported} новых активностей`,
            { duration: 5000 }
          );
        }
      } catch {
        // background sync — don't bother the user on failure
      }
    };

    run();
  }, [user]);
}
