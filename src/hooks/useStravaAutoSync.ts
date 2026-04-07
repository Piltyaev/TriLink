import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// не чаще раза в час за сессию
const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export function useStravaAutoSync() {
  const { user } = useAuth();
  const didSync = useRef(false);

  useEffect(() => {
    if (!user || didSync.current) return;
    didSync.current = true;

    const run = async () => {
      try {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (!session) return;

        const { data } = await supabase
          .from("strava_tokens")
          .select("last_sync_at")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!data) return;

        const lastSync = data.last_sync_at
          ? new Date(data.last_sync_at).getTime()
          : 0;

        if (Date.now() - lastSync < SYNC_INTERVAL_MS) return;

        const { data: result, error } = await supabase.functions.invoke(
          "strava-sync",
          { body: { userId: session.user.id } }
        );

        if (!error && result?.imported > 0) {
          toast.success(
            `Strava: импортировано ${result.imported} новых активностей`,
            { duration: 5000 }
          );
        }
      } catch {
        // фоновая синхронизация — ошибку не показываем
      }
    };

    run();
  }, [user]);
}
