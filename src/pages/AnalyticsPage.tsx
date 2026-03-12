import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { type Workout, mapWorkout } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  TrendingUp, Activity, MapPin,
  Waves, Bike, PersonStanding, Dumbbell, BarChart3,
} from "lucide-react";
import { cn, dateISO } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMin(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}ч${m > 0 ? ` ${m}м` : ''}` : `${m}м`;
}

// Shared tooltip style
const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 12,
    fontSize: 12,
    boxShadow: '0 8px 24px hsl(0 0% 0% / 0.55)',
    padding: '8px 12px',
  },
  labelStyle:   { color: 'hsl(var(--foreground))', fontWeight: 700, marginBottom: 4 },
  itemStyle:    { color: 'hsl(var(--muted-foreground))' },
};

const axisProps = {
  tick:   { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
  stroke: 'transparent',
  tickLine: false,
  axisLine: false,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function BigStatCard({
  label, value, sub, icon, accent, delay = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_hsl(0_0%_0%/0.3)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl mb-3",
        accent
      )}>
        {icon}
      </div>
      <p className="font-display text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function ChartCard({
  title, subtitle, icon, children, delay = 0, className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_hsl(0_0%_0%/0.3)]",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  usePageTitle('Аналитика');
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', dateISO(42))
      .order('date', { ascending: true })
      .then(({ data }) => {
        setWorkouts((data || []).map(r => mapWorkout(r as Record<string, unknown>)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // ── Compute ───────────────────────────────────────────────────────────────

  // Weekly volume (last 6 weeks)
  const weeklyVolume: { week: string; swim: number; bike: number; run: number; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    weeklyVolume.push({ week: `Н${6 - i}`, swim: 0, bike: 0, run: 0, total: 0 });
  }
  workouts.forEach(w => {
    const diffDays = Math.floor((Date.now() - new Date(w.date).getTime()) / 86400000);
    const idx = Math.min(Math.floor(diffDays / 7), 5);
    const wi = 5 - idx;
    if (wi >= 0) {
      if (w.sport === 'swim')  { weeklyVolume[wi].swim  += w.duration; weeklyVolume[wi].total += w.duration; }
      if (w.sport === 'bike')  { weeklyVolume[wi].bike  += w.duration; weeklyVolume[wi].total += w.duration; }
      if (w.sport === 'run')   { weeklyVolume[wi].run   += w.duration; weeklyVolume[wi].total += w.duration; }
    }
  });

  // Summary stats
  const totalWorkouts  = workouts.length;
  const totalDuration  = workouts.reduce((s, w) => s + w.duration, 0);
  const avgDuration    = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const totalDistance  = workouts.reduce((s, w) => s + (w.distance || 0), 0);
  // Sport breakdown
  const swimMin     = workouts.filter(w => w.sport === 'swim').reduce((s, w) => s + w.duration, 0);
  const bikeMin     = workouts.filter(w => w.sport === 'bike').reduce((s, w) => s + w.duration, 0);
  const runMin      = workouts.filter(w => w.sport === 'run').reduce((s, w) => s + w.duration, 0);
  const strengthMin = workouts.filter(w => w.sport === 'strength').reduce((s, w) => s + w.duration, 0);
  const sportTotal  = swimMin + bikeMin + runMin + strengthMin || 1;

  const sportBreakdown = [
    { label: 'Плавание',  min: swimMin,     pct: Math.round((swimMin     / sportTotal) * 100), color: 'bg-swim',     icon: <Waves           className="h-4 w-4" />, accent: 'text-swim'     },
    { label: 'Велосипед', min: bikeMin,     pct: Math.round((bikeMin     / sportTotal) * 100), color: 'bg-bike',     icon: <Bike            className="h-4 w-4" />, accent: 'text-bike'     },
    { label: 'Бег',       min: runMin,      pct: Math.round((runMin      / sportTotal) * 100), color: 'bg-run',      icon: <PersonStanding  className="h-4 w-4" />, accent: 'text-run'      },
    { label: 'Сила',      min: strengthMin, pct: Math.round((strengthMin / sportTotal) * 100), color: 'bg-strength', icon: <Dumbbell        className="h-4 w-4" />, accent: 'text-strength' },
  ].filter(s => s.min > 0).sort((a, b) => b.min - a.min);

  // Radar
  const maxSport  = Math.max(swimMin, bikeMin, runMin, strengthMin, 1);
  const radarData = [
    { metric: 'Плавание',  value: Math.round((swimMin     / maxSport) * 100) },
    { metric: 'Велосипед', value: Math.round((bikeMin     / maxSport) * 100) },
    { metric: 'Бег',       value: Math.round((runMin      / maxSport) * 100) },
    { metric: 'Сила',      value: Math.round((strengthMin / maxSport) * 100) },
    { metric: 'Частота',   value: Math.min(totalWorkouts * 5, 100) },
    { metric: 'Объём',     value: Math.min(Math.round(totalDuration / 12), 100) },
  ];

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-4 lg:p-8 space-y-6">
        <div>
          <div className="h-8 w-40 rounded-lg bg-card animate-pulse mb-2" />
          <div className="h-4 w-64 rounded-lg bg-card animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-card animate-pulse" />
        <div className="grid gap-5 lg:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────

  if (workouts.length === 0) {
    return (
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Аналитика</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Тренды и анализ формы за последние 6 недель</p>
        </div>
        <motion.div
          className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-border bg-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <BarChart3 className="h-8 w-8 text-primary/60" />
          </div>
          <p className="font-display text-lg font-semibold">Нет данных для анализа</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Добавьте тренировки, чтобы увидеть графики, статистику и профиль атлета
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-display text-2xl font-bold">Аналитика</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Тренды и анализ формы за последние 6 недель</p>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <BigStatCard
          label="Тренировок"
          value={totalWorkouts}
          sub="за 6 недель"
          icon={<TrendingUp className="h-4 w-4" />}
          accent="bg-primary/10 text-primary"
          delay={0.05}
        />
        <BigStatCard
          label="Ср. длительность"
          value={avgDuration ? `${avgDuration} мин` : '—'}
          icon={<Activity className="h-4 w-4" />}
          accent="bg-swim/15 text-swim-foreground"
          delay={0.1}
        />
        <BigStatCard
          label="Дистанция"
          value={totalDistance > 0 ? `${totalDistance.toFixed(0)} км` : '—'}
          icon={<MapPin className="h-4 w-4" />}
          accent="bg-run/15 text-run-foreground"
          delay={0.15}
        />
      </div>

      {/* ── Sport breakdown ────────────────────────────────── */}
      {sportBreakdown.length > 0 && (
        <ChartCard
          title="Распределение по дисциплинам"
          subtitle="Суммарный объём за 6 недель"
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          delay={0.22}
        >
          <div className="space-y-3">
            {sportBreakdown.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={cn("flex items-center gap-2 text-sm font-medium", s.accent)}>
                    {s.icon}
                    {s.label}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatMin(s.min)}</span>
                    <span className="text-xs font-semibold w-8 text-right text-foreground">{s.pct}%</span>
                  </div>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={cn("h-full rounded-full", s.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* ── Charts grid ────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Stacked bar — weekly volume */}
        <ChartCard
          title="Объём по неделям"
          subtitle="минут по дисциплинам"
          delay={0.28}
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyVolume} barSize={20}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border)/0.4)" />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip {...tooltipStyle} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="swim"  stackId="a" fill="hsl(var(--swim))"  name="Плавание"  radius={[0,0,0,0]} />
              <Bar dataKey="bike"  stackId="a" fill="hsl(var(--bike))"  name="Велосипед" radius={[0,0,0,0]} />
              <Bar dataKey="run"   stackId="a" fill="hsl(var(--run))"   name="Бег"       radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Radar — athlete profile */}
        <ChartCard
          title="Профиль атлета"
          subtitle="относительные показатели"
          delay={0.33}
        >
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar
                name="Показатели"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line — weekly trend */}
        <ChartCard
          title="Тренд нагрузки"
          subtitle="суммарный объём в минутах по неделям"
          delay={0.38}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={weeklyVolume}
              margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid vertical={false} stroke="hsl(var(--border)/0.4)" />
              <XAxis dataKey="week" {...axisProps} />
              <YAxis {...axisProps} width={32} />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                name="Всего мин"
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--card))',
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}
