import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { type Workout, mapWorkout } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SportBadge } from "@/components/SportBadge";
import { StatCard } from "@/components/StatCard";
import { ArrowLeft, Timer, MapPin, Flame, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<Workout | null>(null);
  usePageTitle(workout?.title || 'Тренировка');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setWorkout(data ? mapWorkout(data as Record<string, unknown>) : null);
        setLoading(false);
      });
  }, [id, user]);

  if (loading) {
    return <div className="flex items-center justify-center h-full p-8 text-muted-foreground">Загрузка...</div>;
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-lg font-medium">Тренировка не найдена</p>
          <Link to="/workouts"><Button variant="outline" className="mt-4">← Назад</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <Link to="/workouts">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SportBadge sport={workout.sport} size="md" />
              <span className="text-xs text-muted-foreground">
                {workout.source === 'strava' ? '🔗 Strava' : '✏️ Вручную'}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold">{workout.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{workout.date}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="Время" value={formatDuration(workout.duration)} icon={<Timer className="h-5 w-5" />} />
        {workout.distance && <StatCard title="Дистанция" value={`${workout.distance} км`} icon={<MapPin className="h-5 w-5" />} />}
        {workout.calories && <StatCard title="Калории" value={workout.calories} icon={<Flame className="h-5 w-5" />} />}
        {workout.avgPace && <StatCard title="Ср. темп" value={`${workout.avgPace} /км`} icon={<Gauge className="h-5 w-5" />} />}
      </div>

      {workout.notes && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]">
          <h3 className="font-display text-base font-semibold mb-2">Заметки</h3>
          <p className="text-sm text-muted-foreground">{workout.notes}</p>
        </div>
      )}
    </div>
  );
}
