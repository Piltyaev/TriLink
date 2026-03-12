import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PlayerRank } from "@/components/PlayerRank";
import { getRankByCount } from "@/lib/ranks";

const CATEGORIES = ['Все', 'U15', 'U19', 'U23', 'Elite'] as const;
type Category = typeof CATEGORIES[number];

interface RankEntry {
  id: string;
  full_name: string | null;
  email: string | null;
  age_category: string | null;
  workout_count: number;
}

const medalColor = (i: number) =>
  i === 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  : i === 1 ? 'bg-slate-400/15 text-slate-400 border-slate-400/30'
  : i === 2 ? 'bg-orange-700/15 text-orange-500 border-orange-700/30'
  : 'bg-primary/8 text-primary/60 border-primary/20';

const categoryColor: Record<string, string> = {
  U15:   'bg-blue-500/10 text-blue-400',
  U19:   'bg-violet-500/10 text-violet-400',
  U23:   'bg-cyan-500/10 text-cyan-400',
  Elite: 'bg-amber-500/10 text-amber-400',
};

export default function RankingPage() {
  usePageTitle('Рейтинг');
  const { user } = useAuth();
  const [entries,  setEntries]  = useState<RankEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState<Category>('Все');

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, age_category, workout_count')
      .order('workout_count', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setEntries((data || []).map(p => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          age_category: p.age_category,
          workout_count: p.workout_count ?? 0,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = category === 'Все'
    ? entries
    : entries.filter(e => e.age_category === category);

  const top3  = filtered.slice(0, 3);
  const rest  = filtered.slice(3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Рейтинг</h1>
            <p className="text-sm text-muted-foreground">Лучшие атлеты платформы по количеству тренировок</p>
          </div>
        </div>
      </motion.div>

      {/* Category filter */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-150",
              category === cat
                ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-border bg-card"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        >
          <Users className="h-12 w-12 text-muted-foreground/20 mb-3" />
          <p className="font-display text-lg font-semibold">Нет атлетов в этой категории</p>
          <p className="text-sm text-muted-foreground mt-1">Пользователи ещё не указали возрастную категорию</p>
        </motion.div>
      ) : (
        <div className="space-y-4">

          {/* Podium — top 3 */}
          {top3.length > 0 && (
            <motion.div
              className="grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            >
              {top3.map((entry, i) => {
                const isMe = user?.id === entry.id;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all",
                      medalColor(i),
                      i === 0 && "shadow-[0_0_24px_hsl(var(--primary)/0.2)] scale-[1.02]",
                      isMe && "ring-2 ring-primary/40"
                    )}
                  >
                    <div className="text-3xl mb-1">{medals[i]}</div>
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold mb-2",
                      i === 0 ? "bg-yellow-500/25 text-yellow-300"
                        : i === 1 ? "bg-slate-400/20 text-slate-300"
                        : "bg-orange-600/20 text-orange-400"
                    )}>
                      {(entry.full_name || entry.email || 'U')[0].toUpperCase()}
                    </div>
                    <p className="text-xs font-semibold truncate w-full leading-tight">
                      {entry.full_name || entry.email?.split('@')[0] || 'Атлет'}
                      {isMe && <span className="block text-[10px] text-primary">(вы)</span>}
                    </p>
                    {entry.age_category && (
                      <span className={cn("mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium", categoryColor[entry.age_category] || 'bg-muted text-muted-foreground')}>
                        {entry.age_category}
                      </span>
                    )}
                    <div className="mt-2">
                      <span className="font-display text-xl font-bold">{entry.workout_count}</span>
                      <span className="block text-[10px] text-muted-foreground">тренировок</span>
                    </div>
                    <div className="mt-2">
                      <PlayerRank rank={getRankByCount(entry.workout_count)} size="sm" showLabel />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Rest of the list */}
          {rest.length > 0 && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_2px_8px_hsl(0_0%_0%/0.3)]">
              {rest.map((entry, idx) => {
                const pos = idx + 4;
                const isMe = user?.id === entry.id;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.03 }}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5 border-b border-border/40 last:border-0 transition-colors hover:bg-accent/20",
                      isMe && "bg-primary/5"
                    )}
                  >
                    <span className="w-6 text-sm font-bold text-muted-foreground/60 shrink-0 text-center">{pos}</span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {(entry.full_name || entry.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.full_name || entry.email?.split('@')[0] || 'Атлет'}
                        {isMe && <span className="ml-1.5 text-[10px] text-primary">(вы)</span>}
                      </p>
                    </div>
                    {entry.age_category && (
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", categoryColor[entry.age_category] || 'bg-muted text-muted-foreground')}>
                        {entry.age_category}
                      </span>
                    )}
                    <div className="shrink-0 flex items-center gap-3">
                      <PlayerRank rank={getRankByCount(entry.workout_count)} size="sm" showLabel />
                      <div className="text-right">
                        <span className="font-display text-base font-bold">{entry.workout_count}</span>
                        <span className="text-xs text-muted-foreground ml-1">тр.</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
