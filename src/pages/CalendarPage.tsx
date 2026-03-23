import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  sportColors, sportLabels, sportIconBg, sportBorderLeft,
  type SportType, type CalendarEvent, mapCalendarEvent,
  type Workout, mapWorkout, SPORTS,
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Check, Zap,
  Waves, Bike, PersonStanding, Dumbbell, BedDouble,
  Timer, MapPin, Flame, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, toLocalISO, formatDuration, dateISO } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SportIcon } from "@/lib/iconMap";

// ── Types ─────────────────────────────────────────────────────────────────────

type CalendarItem =
  | { kind: 'event';   event:   CalendarEvent }
  | { kind: 'workout'; workout: Workout };

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS   = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const sportIcons: Record<SportType, React.ReactNode> = {
  swim:     <Waves className="h-5 w-5" />,
  bike:     <Bike className="h-5 w-5" />,
  run:      <PersonStanding className="h-5 w-5" />,
  strength: <Dumbbell className="h-5 w-5" />,
  rest:     <BedDouble className="h-5 w-5" />,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0 … Sun=6
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface WorkoutForm {
  title:    string;
  sport:    SportType;
  date:     string;
  duration: string;
  notes:    string;
}

const emptyForm = (date = ''): WorkoutForm => ({
  title: '', sport: 'run', date, duration: '60', notes: '',
});

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  usePageTitle('Календарь');
  const { user } = useAuth();
  const now = new Date();

  const [year,       setYear]       = useState(now.getFullYear());
  const [month,      setMonth]      = useState(now.getMonth());
  const [filter,     setFilter]     = useState<SportType | 'all'>('all');
  const [events,     setEvents]     = useState<CalendarEvent[]>([]);
  const [workouts,   setWorkouts]   = useState<Workout[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<'add' | 'edit' | null>(null);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [viewWorkout, setViewWorkout] = useState<Workout | null>(null);
  const [form,       setForm]       = useState<WorkoutForm>(emptyForm());
  const [formError,  setFormError]  = useState('');
  const [saving,     setSaving]     = useState(false);

  const loadData = () => {
    if (!user) return;
    Promise.all([
      supabase.from('calendar_events').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      supabase.from('workouts').select('id,title,sport,date,duration,source,distance,avg_hr,max_hr,avg_pace,calories,tss,rpe,notes').eq('user_id', user.id).gte('date', dateISO(365)).order('date', { ascending: true }),
    ]).then(([evRes, woRes]) => {
      setEvents((evRes.data || []).map(r => mapCalendarEvent(r as Record<string, unknown>)));
      setWorkouts((woRes.data || []).map(r => mapWorkout(r as Record<string, unknown>)));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const allItems: CalendarItem[] = [
    ...events.map(e  => ({ kind: 'event'   as const, event:   e })),
    ...workouts.map(w => ({ kind: 'workout' as const, workout: w })),
  ];

  const filtered = allItems.filter(item => {
    const sport = item.kind === 'event' ? item.event.sport : item.workout.sport;
    return filter === 'all' || sport === filter;
  });

  const getItemsForDay = (day: number): CalendarItem[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filtered.filter(item => {
      const date = item.kind === 'event' ? item.event.date : item.workout.date;
      return date === dateStr;
    });
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const today       = toLocalISO(new Date());

  const upcoming = events
    .filter(e => !e.completed && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);


  // ── Navigation ──────────────────────────────────────────────────────────────

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openAdd = (day?: number) => {
    const date = day
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : '';
    setForm(emptyForm(date));
    setFormError('');
    setModal('add');
  };

  const openEdit = (ev: CalendarEvent) => {
    setEditingId(ev.id);
    setForm({ title: ev.title, sport: ev.sport, date: ev.date, duration: String(ev.duration), notes: ev.notes || '' });
    setFormError('');
    setModal('edit');
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) { setFormError('Введите название тренировки'); return false; }
    if (!form.date)         { setFormError('Выберите дату');               return false; }
    const dur = parseInt(form.duration);
    if (isNaN(dur) || dur <= 0) { setFormError('Введите корректную длительность (мин)'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;
    const dur = parseInt(form.duration);
    setSaving(true);

    if (modal === 'add') {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          user_id:   user.id,
          title:     form.title.trim(),
          sport:     form.sport,
          date:      form.date,
          duration:  dur,
          completed: false,
          notes:     form.notes.trim() || null,
        });

      setSaving(false);
      if (error) { toast.error(`Ошибка: ${error.message}`); return; }
      toast.success('Тренировка добавлена');
    } else if (modal === 'edit' && editingId) {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title:    form.title.trim(),
          sport:    form.sport,
          date:     form.date,
          duration: dur,
          notes:    form.notes.trim() || null,
        })
        .eq('id', editingId)
        .eq('user_id', user.id);

      setSaving(false);
      if (error) { toast.error(`Ошибка: ${error.message}`); return; }
      toast.success('Тренировка обновлена');
    }
    setModal(null);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) { toast.error(`Ошибка удаления: ${error.message}`); return; }
    toast.success('Тренировка удалена');
    if (modal === 'edit') setModal(null);
    loadData();
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    const { error } = await supabase
      .from('calendar_events')
      .update({ completed: !ev.completed })
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="font-display text-2xl font-bold">Календарь</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Планируйте и отслеживайте тренировки</p>
        </div>
        <Button size="sm" className="gap-2 shrink-0" onClick={() => openAdd()}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </motion.div>

      {/* ── Sport filter pills ──────────────────────────────── */}
      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
            filter === 'all'
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          Все
        </button>
        {SPORTS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
              filter === s
                ? `${sportColors[s]} border-transparent shadow-sm`
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <SportIcon sport={s} className="h-3.5 w-3.5" />
            {sportLabels[s]}
          </button>
        ))}
      </motion.div>

      {/* ── Month navigation ────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
      >
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={prev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold min-w-[180px] text-center">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToday}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Сегодня
          </button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={next}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* ── Calendar grid ───────────────────────────────────── */}
      <motion.div
        className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_2px_8px_hsl(0_0%_0%/0.3)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {loading ? (
          <div className="grid grid-cols-7">
            {DAYS.map(d => (
              <div key={d} className="border-b border-border px-2 py-3 text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                {d}
              </div>
            ))}
            {[...Array(21)].map((_, i) => (
              <div key={i} className="min-h-[80px] border-b border-r border-border/40 p-2">
                <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">

            {/* ── Day-of-week header ────────────────────────── */}
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "border-b border-border px-2 py-3 text-center text-xs font-semibold tracking-wide uppercase",
                  i >= 5 ? "text-muted-foreground/50" : "text-muted-foreground"
                )}
              >
                {d}
              </div>
            ))}

            {/* ── Empty leading cells ───────────────────────── */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div
                key={`empty-${i}`}
                className={cn(
                  "min-h-[80px] lg:min-h-[100px] border-b border-r border-border/40",
                  i >= 5 ? "bg-muted/25" : "bg-muted/10"
                )}
              />
            ))}

            {/* ── Day cells ─────────────────────────────────── */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day     = i + 1;
              const col     = (firstDay + i) % 7;
              const isWeekend = col >= 5;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayItems = getItemsForDay(day);
              const isToday  = dateStr === today;

              return (
                <div
                  key={day}
                  className={cn(
                    "group min-h-[80px] lg:min-h-[100px] border-b border-r border-border/40 p-1.5 cursor-pointer transition-colors",
                    isWeekend && !isToday && "bg-muted/10",
                    isToday ? "bg-primary/8" : "hover:bg-accent/40",
                  )}
                  onClick={() => openAdd(day)}
                >
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                    isToday
                      ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                      : "text-foreground/80 group-hover:bg-accent group-hover:text-foreground",
                  )}>
                    {day}
                  </span>

                  <div className="mt-1 space-y-0.5">
                    {dayItems.slice(0, 2).map(item => {
                      if (item.kind === 'event') {
                        const ev = item.event;
                        return (
                          <div
                            key={`ev-${ev.id}`}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-medium truncate leading-4 cursor-pointer",
                              sportColors[ev.sport],
                              ev.completed && "opacity-40 line-through"
                            )}
                            onClick={e => { e.stopPropagation(); openEdit(ev); }}
                            title={ev.title}
                          >
                            <SportIcon sport={ev.sport} className="h-3 w-3 inline mr-1" /> {ev.title}
                          </div>
                        );
                      }
                      const wo = item.workout;
                      return (
                        <div
                          key={`wo-${wo.id}`}
                          className={cn(
                            "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium truncate leading-4 opacity-70 cursor-pointer hover:opacity-100",
                            sportColors[wo.sport],
                          )}
                          onClick={e => { e.stopPropagation(); setViewWorkout(wo); }}
                          title={`${wo.title} · ${wo.duration} мин`}
                        >
                          <Zap className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate">{wo.title}</span>
                        </div>
                      );
                    })}
                    {dayItems.length > 2 && (
                      <div className="text-[10px] font-medium text-muted-foreground/70 px-1 leading-4">
                        +{dayItems.length - 2} ещё
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Empty state hint ───────────────────────────────── */}
      {!loading && events.length === 0 && workouts.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-border/60 bg-card/40"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm font-medium text-muted-foreground">Нажмите на любой день, чтобы запланировать тренировку</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Или используйте кнопку «Добавить» в верхнем углу</p>
        </motion.div>
      )}

      {/* ── Upcoming planned workouts ───────────────────────── */}
      <AnimatePresence>
        {upcoming.length > 0 && (
          <motion.div
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_8px_hsl(0_0%_0%/0.3)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display text-sm font-semibold mb-4">Предстоящие тренировки</h3>
            <div className="space-y-2">
              {upcoming.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border border-border/50 border-l-[3px] bg-card px-4 py-3 transition-colors hover:bg-accent/30",
                    sportBorderLeft[ev.sport]
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.05 }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm",
                      sportIconBg[ev.sport]
                    )}>
                      <SportIcon sport={ev.sport} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">{ev.date} · {ev.duration} мин</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => handleToggleComplete(ev.id)}
                      title="Отметить выполненной"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(ev)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(ev.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Workout detail modal ────────────────────────────── */}
      <AnimatePresence>
        {viewWorkout && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewWorkout(null)}
          >
            <motion.div
              className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-[0_24px_64px_hsl(0_0%_0%/0.7)]"
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{    scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
                    sportIconBg[viewWorkout.sport]
                  )}>
                    <SportIcon sport={viewWorkout.sport} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-base font-semibold truncate">{viewWorkout.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {viewWorkout.date} · {sportLabels[viewWorkout.sport]}
                      {viewWorkout.source === 'strava' && <span className="ml-2 text-[#FC4C02]">· Strava</span>}
                    </p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 ml-2" onClick={() => setViewWorkout(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard title="Время" value={formatDuration(viewWorkout.duration)} icon={<Timer className="h-5 w-5" />} />
                  {viewWorkout.distance
                    ? <StatCard title="Дистанция" value={`${viewWorkout.distance} км`} icon={<MapPin className="h-5 w-5" />} />
                    : <div />
                  }
                  {viewWorkout.calories
                    ? <StatCard title="Калории" value={String(viewWorkout.calories)} icon={<Flame className="h-5 w-5" />} />
                    : null
                  }
                  {viewWorkout.avgPace
                    ? <StatCard title="Ср. темп" value={`${viewWorkout.avgPace} /км`} icon={<Gauge className="h-5 w-5" />} />
                    : null
                  }
                </div>

                {viewWorkout.notes && (
                  <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Заметки</p>
                    <p className="text-sm text-foreground/80">{viewWorkout.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5">
                <Button className="w-full" variant="outline" onClick={() => setViewWorkout(null)}>
                  Закрыть
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border bg-card shadow-[0_24px_64px_hsl(0_0%_0%/0.7)]"
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{    scale: 0.96, y: 16, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/50">
                <h3 className="font-display text-base font-semibold">
                  {modal === 'add' ? 'Новая тренировка' : 'Редактировать'}
                </h3>
                <div className="flex items-center gap-1">
                  {modal === 'edit' && editingId && (
                    <Button
                      size="icon" variant="ghost"
                      className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(editingId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setModal(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-5">

                {/* Title */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Название
                  </Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Например: Длинная пробежка"
                    className="mt-1.5"
                  />
                </div>

                {/* Sport icon grid */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Тип тренировки
                  </Label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {SPORTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sport: s }))}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all duration-150",
                          form.sport === s
                            ? `${sportColors[s]} border-transparent shadow-sm`
                            : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <span className="[&>svg]:h-5 [&>svg]:w-5">{sportIcons[s]}</span>
                        <span className="text-[10px] font-medium leading-none">{sportLabels[s]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Дата
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Длительность (мин)
                    </Label>
                    <Input
                      type="number"
                      value={form.duration}
                      onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      min={1}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Заметки (необязательно)
                  </Label>
                  <Input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Комментарий к тренировке"
                    className="mt-1.5"
                  />
                </div>

                {/* Validation error */}
                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 px-6 pb-6">
                <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>
                  Отмена
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : modal === 'add' ? 'Добавить' : 'Сохранить'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
