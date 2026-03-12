import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  User, Link2, Target, Activity,
  AlertCircle, LogOut, Loader2, CheckCircle2,
  RefreshCw, Zap, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/strava/callback`;

const GOAL_PRESETS = [
  { label: '2ч',  value: 120 },
  { label: '3ч',  value: 180 },
  { label: '5ч',  value: 300 },
  { label: '7ч',  value: 420 },
  { label: '10ч', value: 600 },
];

interface StravaStatus {
  connected: boolean;
  athlete_name?: string;
  last_sync?: string;
  activities_count?: number;
}

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-border/50">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconClass)}>
        {icon}
      </div>
      <h2 className="font-display text-base font-semibold">{title}</h2>
    </div>
  );
}

// ── Row for sync stats ───────────────────────────────────────────────────────
function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium", accent ? "text-bike" : "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  usePageTitle('Настройки');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [name,        setName]        = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [weight,      setWeight]      = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Goal
  const [weeklyGoal, setWeeklyGoal] = useState('300');
  const [savingGoals, setSavingGoals] = useState(false);

  // Sync form fields when user metadata becomes available
  useEffect(() => {
    if (!user) return;
    setName(user.user_metadata?.full_name || '');
    setAgeCategory(String(user.user_metadata?.age_category || ''));
    setWeight(String(user.user_metadata?.weight || ''));
    setWeeklyGoal(String(user.user_metadata?.weekly_goal || 300));
  }, [user]);

  // Strava
  const [stravaStatus, setStravaStatus] = useState<StravaStatus>({ connected: false });
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => { loadStravaStatus(); }, []);

  const loadStravaStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('strava_tokens')
        .select('athlete_name, last_sync_at, activities_count')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setStravaStatus({
          connected: true,
          athlete_name: data.athlete_name ?? undefined,
          last_sync: data.last_sync_at
            ? new Date(data.last_sync_at).toLocaleString('ru-RU')
            : 'Никогда',
          activities_count: data.activities_count || 0,
        });
      }
    } catch { /* not connected */ }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const [authRes] = await Promise.all([
      supabase.auth.updateUser({
        data: {
          full_name: name,
          age_category: ageCategory || null,
          weight: weight ? parseFloat(weight) : null,
        },
      }),
      supabase.from('profiles').upsert({
        id: user.id,
        full_name: name,
        email: user.email,
        age_category: ageCategory || null,
        weight: weight ? parseFloat(weight) : null,
      }),
    ]);
    setSavingProfile(false);
    if (authRes.error) toast.error('Ошибка сохранения профиля');
    else toast.success('Профиль сохранён');
  };

  const handleSaveGoals = async () => {
    if (!user) return;
    const goal = parseInt(weeklyGoal);
    if (isNaN(goal) || goal < 1) { toast.error('Введите корректное значение'); return; }
    setSavingGoals(true);
    const { error } = await supabase.auth.updateUser({ data: { weekly_goal: goal } });
    setSavingGoals(false);
    if (error) toast.error('Ошибка сохранения');
    else toast.success('Цель сохранена');
  };

  const handleConnectStrava = () => {
    if (!STRAVA_CLIENT_ID) { toast.error('VITE_STRAVA_CLIENT_ID не задан в .env'); return; }
    const params = new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'read,activity:read_all',
    });
    window.location.href = `https://www.strava.com/oauth/authorize?${params}`;
  };

  const handleDisconnectStrava = async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      await supabase.from('strava_tokens').delete().eq('user_id', user.id);
      setStravaStatus({ connected: false });
      toast.success('Strava отключена');
    } catch { toast.error('Не удалось отключить Strava'); }
    setDisconnecting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('strava-sync', {
        body: { userId: user?.id },
      });
      if (error) throw error;
      toast.success(`Синхронизировано: ${data?.imported || 0} активностей`);
      loadStravaStatus();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ошибка синхронизации');
    }
    setSyncing(false);
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  // Derived
  const initials = getInitials(user?.user_metadata?.full_name, user?.email);
  const displayName = name || user?.email?.split('@')[0] || 'Атлет';
  const goalNum = parseInt(weeklyGoal) || 300;
  const goalHours = (goalNum / 60).toFixed(1);
  const previewPct = Math.min(100, Math.round((300 / goalNum) * 100));

  const card = "rounded-2xl border border-border bg-card shadow-[0_2px_12px_hsl(0_0%_0%/0.35)]";
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut', delay },
  });

  return (
    <div className="p-4 lg:p-8 max-w-2xl space-y-5">

      {/* ── Page title ──────────────────────────────────────── */}
      <motion.div {...fadeUp(0)}>
        <h1 className="font-display text-2xl font-bold">Настройки</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Профиль, цели и подключения</p>
      </motion.div>

      {/* ── Profile banner card ─────────────────────────────── */}
      <motion.div className={cn(card, "overflow-hidden")} {...fadeUp(0.05)}>
        {/* Gradient banner */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/15 to-swim/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_50%,hsl(var(--primary)/0.25),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card/80 to-transparent" />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-4 border-card bg-gradient-to-br from-primary/25 to-primary/10 text-primary text-xl font-bold shadow-[0_0_0_2px_hsl(var(--primary)/0.25)]">
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-bike border-2 border-card">
                <Activity className="h-2.5 w-2.5 text-bike-foreground" />
              </div>
            </div>
            {/* Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </Button>
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-tight">{displayName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Profile fields ──────────────────────────────────── */}
      <motion.div className={cn(card, "p-6 space-y-5")} {...fadeUp(0.1)}>
        <SectionHeader
          icon={<User className="h-4 w-4" />}
          title="Данные профиля"
          iconClass="bg-primary/10 text-primary"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Имя
            </Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              value={user?.email || ''}
              className="mt-1.5 opacity-60"
              disabled
            />
          </div>
        </div>

        {/* Age category + Weight */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Возрастная категория
            </Label>
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {(['U15','U19','U23','Elite'] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAgeCategory(ageCategory === cat ? '' : cat)}
                  className={cn(
                    "rounded-lg border py-1.5 text-xs font-semibold transition-all duration-150",
                    ageCategory === cat
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="weight" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Вес (кг)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min={20}
              max={200}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="70.5"
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="min-w-[120px]">
            {savingProfile
              ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Сохранение...</>
              : 'Сохранить'
            }
          </Button>
        </div>
      </motion.div>

      {/* ── Weekly goal ─────────────────────────────────────── */}
      <motion.div className={cn(card, "p-6 space-y-5")} {...fadeUp(0.15)}>
        <SectionHeader
          icon={<Target className="h-4 w-4" />}
          title="Цель недели"
          iconClass="bg-run/10 text-run"
        />

        {/* Big number display */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-display text-5xl font-bold text-foreground">{goalNum}</span>
              <span className="text-lg text-muted-foreground">мин</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {goalHours} часов тренировок в неделю
            </p>
          </div>
          <div className="shrink-0">
            <Input
              type="number"
              min={1}
              max={10080}
              value={weeklyGoal}
              onChange={e => setWeeklyGoal(e.target.value)}
              className="w-[100px] text-center font-mono"
              placeholder="мин"
            />
            <p className="text-[10px] text-muted-foreground text-center mt-1">мин/нед</p>
          </div>
        </div>

        {/* Preset chips */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Быстрый выбор</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map(p => {
              const active = weeklyGoal === String(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setWeeklyGoal(String(p.value))}
                  className={cn(
                    "group flex flex-col items-center rounded-xl border px-4 py-2.5 text-xs transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
                      : "border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("font-display text-base font-bold", active ? "text-primary-foreground" : "text-foreground")}>
                    {p.label}
                  </span>
                  <span className={cn("opacity-70 text-[10px]", active ? "" : "group-hover:opacity-100")}>
                    {p.value}м
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview bar */}
        <div className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3 w-3" /> Предпросмотр прогресс-бара
            </span>
            <span className="font-medium text-foreground">
              300 / {goalNum} мин · {previewPct}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${previewPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Так выглядит прогресс при текущем объёме ~300 мин/нед
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSaveGoals} disabled={savingGoals} className="min-w-[130px]">
            {savingGoals
              ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Сохранение...</>
              : 'Сохранить цель'
            }
          </Button>
        </div>
      </motion.div>

      {/* ── Strava + Sync ───────────────────────────────────── */}
      <motion.div className={cn(card, "p-6 space-y-5")} {...fadeUp(0.2)}>
        <SectionHeader
          icon={<Zap className="h-4 w-4" />}
          title="Strava"
          iconClass="bg-[#FC4C02]/10 text-[#FC4C02]"
        />

        {/* Connection status */}
        <div className={cn(
          "flex items-center justify-between rounded-xl border p-4 transition-colors",
          stravaStatus.connected
            ? "border-bike/30 bg-bike/5"
            : "border-border/50 bg-background/30"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              stravaStatus.connected ? "bg-bike/20" : "bg-muted"
            )}>
              {stravaStatus.connected
                ? <CheckCircle2 className="h-5 w-5 text-bike" />
                : <Activity className="h-5 w-5 text-muted-foreground" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold">
                {stravaStatus.connected ? 'Подключено' : 'Не подключено'}
              </p>
              <p className="text-xs text-muted-foreground">
                {stravaStatus.connected && stravaStatus.athlete_name
                  ? stravaStatus.athlete_name
                  : 'Strava Connect'}
              </p>
            </div>
          </div>
          {stravaStatus.connected ? (
            <Button size="sm" variant="destructive" onClick={handleDisconnectStrava} disabled={disconnecting}>
              {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Отключить'}
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnectStrava} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Подключить
            </Button>
          )}
        </div>

        {/* Garmin tip */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/60 border border-border/40 p-3.5">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Garmin Connect:</span> включи
            автосинхронизацию со Strava — тренировки с часов будут автоматически попадать в TriLink.
          </p>
        </div>

        {/* Sync stats */}
        <div className="rounded-xl border border-border/50 bg-background/30 px-4 py-1 divide-y divide-border/30">
          <StatRow
            label="Последняя синхронизация"
            value={stravaStatus.last_sync || '—'}
          />
          <StatRow
            label="Тренировок импортировано"
            value={String(stravaStatus.activities_count ?? 0)}
          />
          <StatRow
            label="Статус"
            value={stravaStatus.connected ? 'Активно' : 'Не подключено'}
            accent={stravaStatus.connected}
          />
        </div>

        {/* Sync button */}
        <Button
          variant="outline"
          size="sm"
          disabled={!stravaStatus.connected || syncing}
          onClick={handleSync}
          className="gap-2 w-full sm:w-auto"
        >
          {syncing
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Синхронизация...</>
            : <><RefreshCw className="h-3.5 w-3.5" /> Синхронизировать сейчас</>
          }
        </Button>
      </motion.div>

    </div>
  );
}
