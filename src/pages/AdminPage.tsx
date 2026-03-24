import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Shield, Users, Activity, Database, Lock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'bobpltm@gmail.com';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  last_seen: string | null;
  workout_count: number | null;
}

export default function AdminPage() {
  usePageTitle('Админ');
  const { user } = useAuth();

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold">Доступ запрещён</h2>
        <p className="text-sm text-muted-foreground max-w-xs">У вас нет прав для просмотра этой страницы.</p>
        <Button asChild variant="outline">
          <Link to="/dashboard">На главную</Link>
        </Button>
      </div>
    );
  }
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;

    const fetchData = async () => {
      try {
        const [profilesRes, workoutsRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('workouts').select('id', { count: 'exact', head: true }),
        ]);
        if (!cancelled) {
          setProfiles((profilesRes.data || []) as Profile[]);
          setTotalWorkouts(workoutsRes.count || 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const activeRecently = profiles.filter(p => {
    if (!p.last_seen) return false;
    const diff = Date.now() - new Date(p.last_seen).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="font-display text-2xl font-bold">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">Управление пользователями и статистика</p>
        </div>
      </div>

      <motion.div className="grid grid-cols-2 gap-3 lg:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <StatCard title="Пользователи" value={profiles.length} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Тренировок всего" value={totalWorkouts} icon={<Activity className="h-5 w-5" />} />
        <StatCard title="Активных за 7д" value={activeRecently} subtitle={activeRecently > 0 ? 'за последние 7 дней' : 'нет активности'} trend={activeRecently > 0 ? 'up' : 'neutral'} icon={<Activity className="h-5 w-5" />} />
        <StatCard title="База данных" value="Supabase" icon={<Database className="h-5 w-5" />} />
      </motion.div>

      <motion.div
        className="rounded-xl border border-border bg-card overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-5 border-b border-border">
          <h3 className="font-display text-base font-semibold">Зарегистрированные пользователи</h3>
        </div>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        ) : profiles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">Нет зарегистрированных пользователей</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium">Тренировок</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email || '—'}</td>
                    <td className="px-4 py-3 text-sm">{u.workout_count ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
