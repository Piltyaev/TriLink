import type { Workout } from "@/data/mockData";
import { toLocalISO } from "@/lib/utils";

export interface Badge {
  id: string;
  icon: string;
  label: string;
  desc: string;
  color: string;
}

const ALL_BADGES: Badge[] = [
  // ── Позитивные ────────────────────────────────────────────────────────────
  {
    id: 'first_step',
    icon: 'Flag',
    label: 'Кровавый старт',
    desc: 'Добавлена первая тренировка',
    color: 'bg-green-500/15 text-green-300 border-green-500/30',
  },
  {
    id: 'week_streak',
    icon: 'Flame',
    label: 'Берсерк',
    desc: '7 дней подряд без пропусков',
    color: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  {
    id: 'two_week_streak',
    icon: 'Zap',
    label: 'Нон-стоп',
    desc: '14 дней подряд без пропусков',
    color: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  },
  {
    id: 'triathlete',
    icon: 'Target',
    label: 'Машина',
    desc: 'Плавание, вело и бег за одну неделю',
    color: 'bg-primary/15 text-primary border-primary/30',
  },
  {
    id: 'swimmer',
    icon: 'Waves',
    label: 'Без тормозов',
    desc: '10 тренировок по плаванию',
    color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'cyclist',
    icon: 'Bike',
    label: 'Одержимый',
    desc: '10 велотренировок',
    color: 'bg-green-500/15 text-green-300 border-green-500/30',
  },
  {
    id: 'runner',
    icon: 'PersonStanding',
    label: 'Зверь',
    desc: '10 пробежек',
    color: 'bg-run/20 text-run-foreground border-run/30',
  },
  {
    id: 'hundred_km',
    icon: 'BadgeCheck',
    label: 'Сотка — не шутка',
    desc: '100 км суммарной дистанции',
    color: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  {
    id: 'marathon',
    icon: 'Mountain',
    label: 'Титан',
    desc: 'Пробежка на 42+ км',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'iron_man',
    icon: 'Dumbbell',
    label: 'Безумец',
    desc: '30 тренировок в копилке',
    color: 'bg-slate-400/15 text-slate-300 border-slate-400/30',
  },
  {
    id: 'century_workouts',
    icon: 'Star',
    label: 'Легенда',
    desc: '100 тренировок выполнено',
    color: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30',
  },
  {
    id: 'early_bird',
    icon: 'Sun',
    label: 'Маньяк 5 утра',
    desc: 'Добавил 5+ тренировок подряд',
    color: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  // ── Штрафные (за пропуски) ────────────────────────────────────────────────
  {
    id: 'missed_1',
    icon: 'ThumbsDown',
    label: 'Тряпка',
    desc: 'Пропустил 1 день',
    color: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
  {
    id: 'missed_2',
    icon: 'MinusCircle',
    label: 'Диванный воин',
    desc: '2 дня подряд без тренировки',
    color: 'bg-red-500/10 text-red-400 border-red-500/25',
  },
  {
    id: 'missed_3',
    icon: 'XCircle',
    label: 'R.I.P. Мотивация',
    desc: '3+ дня подряд без тренировки',
    color: 'bg-red-600/10 text-red-400 border-red-600/25',
  },
  {
    id: 'broken_10',
    icon: 'AlertTriangle',
    label: 'Клоун',
    desc: 'Пропуск после серии 10+ дней',
    color: 'bg-red-600/10 text-red-400 border-red-600/25',
  },
  {
    id: 'long_reset',
    icon: 'TrendingDown',
    label: 'Слив',
    desc: 'Обнуление длинного стрика (5+ дней паузы)',
    color: 'bg-red-700/10 text-red-500 border-red-700/25',
  },
];

function calcMaxStreak(workouts: Workout[]): number {
  const days = new Set(workouts.map(w => w.date));
  const sorted = Array.from(days).sort();
  if (sorted.length === 0) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (diff === 1) { cur++; max = Math.max(max, cur); }
    else cur = 1;
  }
  return max;
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const mon = new Date(d);
  mon.setDate(d.getDate() - day);
  return toLocalISO(mon);
}

function hasTriathlonWeek(workouts: Workout[]): boolean {
  const byWeek = new Map<string, Set<string>>();
  for (const w of workouts) {
    const wk = getWeekKey(w.date);
    if (!byWeek.has(wk)) byWeek.set(wk, new Set());
    byWeek.get(wk)!.add(w.sport);
  }
  for (const sports of byWeek.values()) {
    if (sports.has('swim') && sports.has('bike') && sports.has('run')) return true;
  }
  return false;
}

interface GapInfo {
  maxGap: number;
  brokenStreakOf10: boolean;
  brokenLongStreak: boolean;
}

function calcGapInfo(workouts: Workout[]): GapInfo {
  const sorted = Array.from(new Set(workouts.map(w => w.date))).sort();
  if (sorted.length === 0) return { maxGap: 0, brokenStreakOf10: false, brokenLongStreak: false };

  let maxGap = 0;
  let brokenStreakOf10 = false;
  let brokenLongStreak = false;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const dayDiff = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000);
    if (dayDiff === 1) {
      currentStreak++;
    } else {
      const missed = dayDiff - 1;
      if (currentStreak >= 10) brokenStreakOf10 = true;
      if (currentStreak >= 5 && missed >= 5) brokenLongStreak = true;
      maxGap = Math.max(maxGap, missed);
      currentStreak = 1;
    }
  }

  // Проверяем текущий разрыв (от последней тренировки до сегодня)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysSinceLast = Math.round((today.getTime() - new Date(sorted[sorted.length - 1]).getTime()) / 86400000);
  if (daysSinceLast > 0) {
    if (currentStreak >= 10) brokenStreakOf10 = true;
    if (currentStreak >= 5 && daysSinceLast >= 5) brokenLongStreak = true;
    maxGap = Math.max(maxGap, daysSinceLast);
  }

  return { maxGap, brokenStreakOf10, brokenLongStreak };
}

export function calcBadges(workouts: Workout[]): Badge[] {
  if (workouts.length === 0) return [];

  const earned: Badge[] = [];
  const add = (id: string) => {
    const b = ALL_BADGES.find(b => b.id === id);
    if (b) earned.push(b);
  };

  const totalKm   = workouts.reduce((s, w) => s + (w.distance ?? 0), 0);
  const maxStreak = calcMaxStreak(workouts);
  const swimCount = workouts.filter(w => w.sport === 'swim').length;
  const bikeCount = workouts.filter(w => w.sport === 'bike').length;
  const runCount  = workouts.filter(w => w.sport === 'run').length;
  const hasMarathon = workouts.some(w => w.sport === 'run' && (w.distance ?? 0) >= 42);
  const { maxGap, brokenStreakOf10, brokenLongStreak } = calcGapInfo(workouts);

  // Позитивные
  if (workouts.length >= 1)       add('first_step');
  if (maxStreak >= 7)             add('week_streak');
  if (maxStreak >= 14)            add('two_week_streak');
  if (hasTriathlonWeek(workouts)) add('triathlete');
  if (swimCount >= 10)            add('swimmer');
  if (bikeCount >= 10)            add('cyclist');
  if (runCount >= 10)             add('runner');
  if (totalKm >= 100)             add('hundred_km');
  if (hasMarathon)                add('marathon');
  if (workouts.length >= 30)      add('iron_man');
  if (workouts.length >= 100)     add('century_workouts');
  if (workouts.length >= 5)       add('early_bird');

  // Штрафные
  if (maxGap >= 1) add('missed_1');
  if (maxGap >= 2) add('missed_2');
  if (maxGap >= 3) add('missed_3');
  if (brokenStreakOf10) add('broken_10');
  if (brokenLongStreak) add('long_reset');

  return earned;
}

export { ALL_BADGES };
