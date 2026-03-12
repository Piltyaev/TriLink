import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Status = 'loading' | 'syncing' | 'success' | 'error';

const STATUS_LABELS: Record<Status, { title: string; sub: string }> = {
  loading: {
    title: 'Подключение Strava...',
    sub:   'Обмен токенами, подождите',
  },
  syncing: {
    title: 'Импорт тренировок...',
    sub:   'Загружаем активности за последние 90 дней',
  },
  success: {
    title: 'Strava подключена!',
    sub:   'Перенаправляем на дашборд...',
  },
  error: {
    title: 'Ошибка подключения',
    sub:   '',
  },
};

export default function StravaCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [imported, setImported] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    const code  = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      const desc = (searchParams.get('error_description') ?? '').toLowerCase();
      if (error === 'too_many_athletes' || desc.includes('quota') || desc.includes('athlete')) {
        setErrorMsg('Приложение временно не принимает новых пользователей Strava — превышен лимит квоты API. Попробуйте позже или добавьте тренировки вручную.');
      } else {
        setErrorMsg('Вы отклонили доступ к Strava');
      }
      return;
    }
    if (!code) {
      setStatus('error');
      setErrorMsg('Не получен код авторизации от Strava');
      return;
    }
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const connect = async () => {
      try {
        // Step 1 — exchange OAuth code for tokens
        const { data, error: fnError } = await supabase.functions.invoke('strava-oauth', {
          body: { code, userId: user.id },
        });

        if (fnError) throw fnError;
        if (data?.error) {
          const msg: string = data.error ?? '';
          if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('athlete')) {
            throw new Error('__quota__');
          }
          throw new Error(msg);
        }

        // Step 2 — initial sync immediately after connecting
        setStatus('syncing');

        const { data: syncData, error: syncError } = await supabase.functions.invoke('strava-sync', {
          body: { userId: user.id },
        });

        const count = syncData?.imported ?? 0;
        setImported(count);

        if (syncError) {
          // Sync failed but OAuth succeeded — still show success
          toast.warning('Strava подключена, но синхронизация не удалась. Попробуйте вручную в Настройках.');
        } else {
          toast.success(
            count > 0
              ? `Strava подключена! Импортировано ${count} активностей`
              : 'Strava подключена! Новых активностей нет.',
            { duration: 5000 }
          );
        }

        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setStatus('error');
        if (raw === '__quota__' || raw.toLowerCase().includes('too many') || raw.toLowerCase().includes('athlete')) {
          setErrorMsg('Приложение временно не принимает новых пользователей Strava — превышен лимит квоты API. Попробуйте позже или добавьте тренировки вручную.');
        } else {
          setErrorMsg(`Ошибка подключения Strava: ${raw}`);
        }
        toast.error('Не удалось подключить Strava');
      }
    };

    connect();
  }, [authLoading, user, searchParams, navigate]);

  const labels = STATUS_LABELS[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-sm space-y-5 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icon */}
        <AnimatePresence mode="wait">
          {(status === 'loading' || status === 'syncing') && (
            <motion.div
              key="spin"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FC4C02]/10">
                <Loader2 className="h-8 w-8 animate-spin text-[#FC4C02]" />
              </div>
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bike/10">
                <CheckCircle2 className="h-9 w-9 text-bike" />
              </div>
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <XCircle className="h-9 w-9 text-destructive" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title + subtitle */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            {labels.title}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {status === 'error' ? errorMsg : labels.sub}
          </p>
        </div>

        {/* Progress dots while loading/syncing */}
        {(status === 'loading' || status === 'syncing') && (
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}

        {/* Success: show import count */}
        {status === 'success' && imported > 0 && (
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-bike/30 bg-bike/10 px-4 py-2 text-sm font-medium text-bike"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="h-4 w-4" />
            {imported} активностей импортировано
          </motion.div>
        )}

        {/* Error: back button */}
        {status === 'error' && (
          <Button onClick={() => navigate('/settings')} className="mt-2">
            Вернуться в настройки
          </Button>
        )}
      </motion.div>
    </div>
  );
}
