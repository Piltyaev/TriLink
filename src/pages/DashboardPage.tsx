import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { StatCard } from "@/components/StatCard";
import { SportBadge } from "@/components/SportBadge";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { type Workout, mapWorkout } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Timer, MapPin, Zap, Plus, ArrowRight, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { cn, formatDuration, toLocalISO, dateISO } from "@/lib/utils";
import { getRankProgress, getTotalMinutes } from "@/lib/ranks";
import { calcBadges, type Badge } from "@/lib/badges";
import { BadgeCelebrationQueue } from "@/components/BadgeCelebration";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function calcStreak(workouts: Workout[]): number {
  const days = new Set(workouts.map(w => w.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const check = new Date(today);
  // Allow today to be empty (don't break streak if user hasn't trained yet today)
  if (!days.has(toLocalISO(check))) {
    check.setDate(check.getDate() - 1);
  }
  while (days.has(toLocalISO(check))) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}


function calcBestDayStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const days = [...new Set(workouts.map(w => w.date))].sort();
  let best = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) { cur++; best = Math.max(best, cur); } else cur = 1;
  }
  return best;
}

function calcBestWeekStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const weekSet = new Set(workouts.map(w => {
    const d = new Date(w.date);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    return `${d.getFullYear()}-${Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)}`;
  }));
  const weeks = [...weekSet].sort();
  let best = 1, cur = 1;
  for (let i = 1; i < weeks.length; i++) {
    const [y1, w1] = weeks[i - 1].split('-').map(Number);
    const [y2, w2] = weeks[i].split('-').map(Number);
    const diff = (y2 - y1) * 52 + (w2 - w1);
    if (diff === 1) { cur++; best = Math.max(best, cur); } else cur = 1;
  }
  return best;
}

const STORAGE_KEY = 'trilink_badges';

export default function DashboardPage() {
  usePageTitle('Дэшборд');
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyVolume, setWeeklyVolume] = useState<{ week: string; swim: number; bike: number; run: number; strength: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const badgeCheckDone = useRef(false);
  const dismissBadge = useCallback(() => setBadgeQueue(q => q.slice(1)), []);

  useEffect(() => {
    if (!user) return;
    const since = dateISO(105);

    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', since)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) return;
        const rows = (data || []).map(r => mapWorkout(r as Record<string, unknown>));
        setWorkouts(rows);
        setStreak(calcStreak(rows));

        // Build weekly volume for last 6 weeks
        const weeks: { week: string; swim: number; bike: number; run: number; strength: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          weeks.push({ week: `Нед ${6 - i}`, swim: 0, bike: 0, run: 0, strength: 0 });
        }
        rows.forEach(w => {
          const diffDays = Math.floor((Date.now() - new Date(w.date).getTime()) / 86400000);
          const idx = Math.min(Math.floor(diffDays / 7), 5);
          const weekIdx = 5 - idx;
          if (weekIdx >= 0 && (w.sport === 'swim' || w.sport === 'bike' || w.sport === 'run' || w.sport === 'strength')) {
            weeks[weekIdx][w.sport] += w.duration;
          }
        });
        setWeeklyVolume(weeks);
      });
  }, [user]);

  // Detect newly earned badges (runs once after first data load)
  useEffect(() => {
    if (loading || badgeCheckDone.current) return;
    badgeCheckDone.current = true;
    const earned = calcBadges(workouts);
    if (earned.length === 0) return;
    const stored: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const storedSet = new Set(stored);
    const newBadges = earned.filter(b => !storedSet.has(b.id));
    if (newBadges.length > 0) {
      setBadgeQueue(newBadges);
      // Store the UNION of previously seen + new — never remove old ones
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...stored, ...newBadges.map(b => b.id)]));
    }
  }, [loading, workouts]);

  const weekStart = dateISO(7);
  const weekWorkouts = workouts.filter(w => w.date >= weekStart);
  const totalDuration = weekWorkouts.reduce((s, w) => s + w.duration, 0);
  const totalDistance = weekWorkouts.reduce((s, w) => s + (w.distance || 0), 0);
  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl bg-card animate-pulse" />
          <div className="h-4 w-80 rounded-lg bg-card animate-pulse" />
          <div className="mt-3 h-12 w-full rounded-xl bg-card animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => <div key={i} className="h-72 rounded-xl bg-card animate-pulse" />)}
        </div>
        <div className="h-40 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  const isNewUser = !loading && workouts.length === 0;

  const totalMins = getTotalMinutes(workouts);
  const { rank, next, progress } = getRankProgress(totalMins);
  const badges = calcBadges(workouts);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <DashboardHeader
        userName={(user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Атлет'}
        streak={streak}
        weeklyMinutes={totalDuration}
        weeklyGoal={Math.max(1, parseInt(user?.user_metadata?.weekly_goal as string || '300') || 300)}
      />

      {isNewUser && (
        <motion.div
          className="rounded-xl border border-primary/30 bg-primary/5 p-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-display text-base font-semibold mb-3">Добро пожаловать в TriLink! 🎉</p>
          <p className="text-sm text-muted-foreground mb-4">Начни отслеживать тренировки — подключи Strava или добавь первую тренировку вручную.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/settings">
              <button className="inline-flex items-center gap-2 rounded-lg bg-[#FC4C02]/10 text-[#FC4C02] border border-[#FC4C02]/20 px-4 py-2 text-sm font-medium hover:bg-[#FC4C02]/20 transition-colors">
                <Zap className="h-4 w-4" /> Подключить Strava
              </button>
            </Link>
            <Link to="/workouts">
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4" /> Добавить тренировку
              </button>
            </Link>
            <Link to="/calendar">
              <button className="inline-flex items-center gap-2 rounded-lg border border-border text-muted-foreground px-4 py-2 text-sm font-medium hover:text-foreground hover:border-border/80 transition-colors">
                Открыть календарь <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-2 gap-3 lg:grid-cols-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StatCard title="Объём" value={formatDuration(totalDuration)} subtitle={`${weekWorkouts.length} тренировок`} icon={<Timer className="h-5 w-5" />} />
        <StatCard title="Дистанция" value={`${totalDistance.toFixed(1)} км`} icon={<MapPin className="h-5 w-5" />} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rank card */}
        <motion.div
          className="rounded-xl border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]"
          style={{ borderColor: `hsl(var(--border))`, boxShadow: `0 0 20px ${rank.glowColor}` }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display text-base font-semibold mb-4">Ваш ранг</h3>
          <div className="flex items-center gap-4 mb-5">
            <div
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-4xl",
                rank.borderColor
              )}
              style={{ boxShadow: `0 0 16px ${rank.glowColor}` }}
            >
              {rank.emoji}
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{rank.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{totalMins.toLocaleString()} мин всего</p>
            </div>
          </div>
          {next ? (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{rank.label}</span>
                <span>{next.emoji} {next.label} — ещё {(next.minMinutes - totalMins).toLocaleString()} мин</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `hsl(var(--primary))` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground mt-1">{progress}%</p>
            </div>
          ) : (
            <p className="text-sm text-amber-300 font-medium">Максимальный ранг достигнут 👑</p>
          )}
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <ActivityHeatmap workouts={workouts} />
      </motion.div>

      {/* ── Стрики ────────────────────────────────────────── */}
      <motion.div
        className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.27 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-run" />
          <h3 className="font-display text-base font-semibold">Стрики</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Текущий', value: streak, unit: streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней', color: 'text-run' },
            { label: 'Лучший дневной', value: calcBestDayStreak(workouts), unit: 'дн.', color: 'text-primary' },
            { label: 'Лучший недельный', value: calcBestWeekStreak(workouts), unit: 'нед.', color: 'text-bike' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-background/30 p-3 text-center">
              <span className={cn("font-display text-2xl font-bold", s.color)}>{s.value}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{s.unit}</span>
              <span className="text-[10px] text-muted-foreground/70 mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Volume Chart */}
      <motion.div
        className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-display text-base font-semibold mb-4">Объём по неделям (мин)</h3>
        {weeklyVolume.some(w => w.swim + w.bike + w.run + w.strength > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyVolume}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px hsl(0 0% 0% / 0.5)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }} itemStyle={{ color: 'hsl(var(--muted-foreground))' }} />
              <Bar dataKey="swim" stackId="a" fill="hsl(var(--swim))" name="Плавание" />
              <Bar dataKey="bike" stackId="a" fill="hsl(var(--bike))" name="Велосипед" />
              <Bar dataKey="run" stackId="a" fill="hsl(var(--run))" name="Бег" />
              <Bar dataKey="strength" stackId="a" fill="hsl(var(--strength))" radius={[4, 4, 0, 0]} name="Сила" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Нет данных. Добавьте тренировки!
          </div>
        )}
      </motion.div>

      {/* ── Recent Workouts + Badges ──────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Workouts */}
        <motion.div
          className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-display text-base font-semibold mb-4">Активность за 6 недель</h3>
          {workouts.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Нет тренировок. Добавьте первую!
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {workouts.slice(0, 10).map(w => (
                <Link to={`/workouts/${w.id}`} key={w.id}>
                  <div className="flex items-center justify-between rounded-lg border border-border/50 p-2.5 hover:bg-accent hover:border-border transition-all duration-150">
                    <div className="flex items-center gap-2">
                      <SportBadge sport={w.sport} />
                      <div>
                        <p className="text-xs font-medium">{w.title}</p>
                        <p className="text-xs text-muted-foreground">{w.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDuration(w.duration)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Badges */}
        <motion.div
          className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-semibold">Достижения</h3>
            <span className="text-xs text-muted-foreground">{badges.length} получено</span>
          </div>
          {badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-4xl mb-2">🎯</span>
              <p className="text-sm text-muted-foreground">Тренируйтесь, чтобы открыть первые достижения!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map(badge => (
                <UITooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold cursor-default transition-transform hover:scale-105",
                        badge.color
                      )}
                    >
                      <span className="text-base leading-none">{badge.emoji}</span>
                      <span>{badge.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {badge.desc}
                  </TooltipContent>
                </UITooltip>
              ))}
            </div>
          )}
        </motion.div>

      </div>

      <BadgeCelebrationQueue queue={badgeQueue} onDismiss={dismissBadge} />
    </div>
  );
}
