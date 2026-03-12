import type { Workout } from "@/data/mockData";

export interface Rank {
  id: string;
  label: string;
  emoji: string;
  minMinutes: number;
  color: string;       // Tailwind bg+text classes
  borderColor: string; // Tailwind border class
  glowColor: string;   // inline style color for glow
  nextLabel?: string;
}

export const RANKS: Rank[] = [
  {
    id: 'rookie',
    label: 'Новичок',
    emoji: '🥉',
    minMinutes: 0,
    color: 'bg-slate-500/20 text-slate-300',
    borderColor: 'border-slate-500/40',
    glowColor: 'hsl(220 10% 60% / 0.3)',
    nextLabel: 'Любитель',
  },
  {
    id: 'amateur',
    label: 'Любитель',
    emoji: '🥈',
    minMinutes: 300,
    color: 'bg-blue-500/20 text-blue-300',
    borderColor: 'border-blue-500/40',
    glowColor: 'hsl(217 91% 60% / 0.3)',
    nextLabel: 'Атлет',
  },
  {
    id: 'athlete',
    label: 'Атлет',
    emoji: '🥇',
    minMinutes: 1000,
    color: 'bg-yellow-500/20 text-yellow-300',
    borderColor: 'border-yellow-500/40',
    glowColor: 'hsl(48 96% 53% / 0.35)',
    nextLabel: 'Профи',
  },
  {
    id: 'pro',
    label: 'Профи',
    emoji: '💎',
    minMinutes: 3000,
    color: 'bg-cyan-500/20 text-cyan-300',
    borderColor: 'border-cyan-500/40',
    glowColor: 'hsl(190 80% 55% / 0.35)',
    nextLabel: 'Элита',
  },
  {
    id: 'elite',
    label: 'Элита',
    emoji: '🔥',
    minMinutes: 6000,
    color: 'bg-orange-500/20 text-orange-300',
    borderColor: 'border-orange-500/40',
    glowColor: 'hsl(24 95% 55% / 0.4)',
    nextLabel: 'Легенда',
  },
  {
    id: 'legend',
    label: 'Легенда',
    emoji: '👑',
    minMinutes: 10000,
    color: 'bg-amber-400/20 text-amber-300',
    borderColor: 'border-amber-400/50',
    glowColor: 'hsl(38 92% 55% / 0.5)',
  },
];

export function getRank(totalMinutes: number): Rank {
  let result = RANKS[0];
  for (const rank of RANKS) {
    if (totalMinutes >= rank.minMinutes) result = rank;
  }
  return result;
}

export function getRankProgress(totalMinutes: number): { rank: Rank; next: Rank | null; progress: number } {
  const rank = getRank(totalMinutes);
  const idx = RANKS.findIndex(r => r.id === rank.id);
  const next = RANKS[idx + 1] ?? null;
  const progress = next
    ? Math.min(100, Math.round(((totalMinutes - rank.minMinutes) / (next.minMinutes - rank.minMinutes)) * 100))
    : 100;
  return { rank, next, progress };
}

export function getTotalMinutes(workouts: Workout[]): number {
  return workouts.reduce((s, w) => s + w.duration, 0);
}

/** Map workout_count (from profiles table) → rank for leaderboard */
export function getRankByCount(count: number): Rank {
  if (count >= 200) return RANKS[5];
  if (count >= 100) return RANKS[4];
  if (count >= 50)  return RANKS[3];
  if (count >= 20)  return RANKS[2];
  if (count >= 5)   return RANKS[1];
  return RANKS[0];
}
