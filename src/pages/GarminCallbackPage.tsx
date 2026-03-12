import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = 'loading' | 'success' | 'error';

export default function GarminCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;

    // Garmin OAuth 1.0a returns oauth_token + oauth_verifier
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');
    const denied = searchParams.get('denied');

    if (denied) {
      setStatus('error');
      setErrorMsg('Вы отклонили доступ к Garmin Connect');
      return;
    }

    if (!oauthToken || !oauthVerifier) {
      setStatus('error');
      setErrorMsg('Не получены параметры авторизации от Garmin');
      return;
    }

    if (!user) {
      navigate('/auth/login');
      return;
    }

    const exchangeToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('garmin-oauth', {
          body: { action: 'access_token', oauth_token: oauthToken, oauth_verifier: oauthVerifier, userId: user.id },
        });

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        setStatus('success');
        toast.success('Garmin Connect успешно подключён!');
        setTimeout(() => navigate('/settings'), 1500);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setStatus('error');
        setErrorMsg(`Ошибка подключения Garmin: ${message}`);
        toast.error('Не удалось подключить Garmin Connect');
      }
    };

    exchangeToken();
  }, [authLoading, user, searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Подключение Garmin...</h2>
            <p className="text-sm text-muted-foreground">Обмен токенами, подождите</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground">Garmin Connect подключён!</h2>
            <p className="text-sm text-muted-foreground">Перенаправляем в настройки...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="font-display text-xl font-bold text-foreground">Ошибка подключения</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button onClick={() => navigate('/settings')} className="mt-4">Вернуться в настройки</Button>
          </>
        )}
      </div>
    </div>
  );
}
