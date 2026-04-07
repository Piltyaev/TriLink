import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  type Workout, sportLabels, sportColors, sportIconBg,
  type SportType, mapWorkout, SPORTS,
} from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { SportIcon } from "@/lib/iconMap";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Timer, MapPin, Search, Plus, X,
  Trash2, Dumbbell, Zap, PenLine, ChevronRight, Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn, formatDuration, toLocalISO, dateISO } from "@/lib/utils";

// вспомогательные функции

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const sportAccent: Record<SportType, string> = {
  swim:     'border-l-swim     bg-swim/8',
  bike:     'border-l-bike     bg-bike/8',
  run:      'border-l-run      bg-run/8',
  strength: 'border-l-strength bg-strength/8',
  rest:     'border-l-rest     bg-rest/8',
};

// типы

interface WorkoutForm {
  title: string;
  sport: SportType;
  date: string;
  duration: string;
  distance: string;
  notes: string;
}

const emptyForm = (): WorkoutForm => ({
  title: '',
  sport: 'run',
  date: toLocalISO(new Date()),
  duration: '60',
  distance: '',
  notes: '',
});

// компонент

export default function WorkoutsPage() {
  usePageTitle('Тренировки');
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SportType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkoutForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = (signal?: { cancelled: boolean }) => {
    if (!user) return;
    supabase
      .from('workouts')
      .select('id,title,sport,date,duration,source,distance,avg_hr,max_hr,avg_pace,calories,tss,rpe,notes')
      .eq('user_id', user.id)
      .gte('date', dateISO(365))
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (signal?.cancelled) return;
        setWorkouts((data || []).map(r => mapWorkout(r as Record<string, unknown>)));
        setLoading(false);
      });
  };

  useEffect(() => {
    const signal = { cancelled: false };
    load(signal);
    return () => { signal.cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const dur = parseInt(form.duration);
    if (!form.title.trim()) { setFormError('Введите название'); return; }
    if (!form.date)          { setFormError('Выберите дату'); return; }
    if (isNaN(dur) || dur <= 0) { setFormError('Введите длительность в минутах'); return; }
    setFormError('');
    setSaving(true);

    if (editingId) {
      const { error } = await supabase.from('workouts').update({
        title:    form.title.trim(),
        sport:    form.sport,
        date:     form.date,
        duration: dur,
        distance: form.distance ? parseFloat(form.distance) : null,
        notes:    form.notes.trim() || null,
      }).eq('id', editingId).eq('user_id', user.id);
      setSaving(false);
      if (error) { toast.error(`Ошибка: ${error.message}`); return; }
      toast.success('Тренировка обновлена');
    } else {
      const { error } = await supabase.from('workouts').insert({
        user_id:  user.id,
        title:    form.title.trim(),
        sport:    form.sport,
        date:     form.date,
        duration: dur,
        distance: form.distance ? parseFloat(form.distance) : null,
        notes:    form.notes.trim() || null,
        source:   'manual',
      });
      setSaving(false);
      if (error) { toast.error(`Ошибка: ${error.message}`); return; }
      toast.success('Тренировка добавлена');
    }
    closeModal();
    load();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from('workouts').delete().eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Ошибка удаления'); return; }
    toast.success('Тренировка удалена');
    if (showModal) closeModal();
    load();
  };

  const filtered = useMemo(() =>
    workouts
      .filter(w => filter === 'all' || w.sport === filter)
      .filter(w => w.title.toLowerCase().includes(search.toLowerCase())),
    [workouts, filter, search]
  );

  // группируем по виду спорта (только те, у которых есть тренировки)
  const GROUP_ORDER: SportType[] = ['swim', 'bike', 'run', 'strength', 'rest'];
  const grouped = useMemo(() => {
    if (filter !== 'all') return null;
    return GROUP_ORDER
      .map(sport => ({
        sport,
        items: filtered.filter(w => w.sport === sport),
      }))
      .filter(g => g.items.length > 0);
  }, [filtered, filter]);

  // итоговые показатели
  const totalDuration  = workouts.reduce((s, w) => s + w.duration, 0);
  const totalDistance  = workouts.reduce((s, w) => s + (w.distance || 0), 0);

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm()); setFormError(''); };
  const openModal = () => { setEditingId(null); setForm(emptyForm()); setFormError(''); setShowModal(true); };
  const openEdit = (w: Workout, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingId(w.id);
    setForm({ title: w.title, sport: w.sport, date: w.date, duration: String(w.duration), distance: w.distance ? String(w.distance) : '', notes: w.notes || '' });
    setFormError('');
    setShowModal(true);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* шапка */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Тренировки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Все ваши активности</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={openModal}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      {/* чипы со статистикой */}
      {!loading && workouts.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[
            { icon: <Dumbbell className="h-3.5 w-3.5" />, value: workouts.length, label: 'тренировок' },
            { icon: <Timer    className="h-3.5 w-3.5" />, value: formatDuration(totalDuration), label: 'суммарно' },
            { icon: <MapPin   className="h-3.5 w-3.5" />, value: `${totalDistance.toFixed(0)} км`, label: 'дистанция' },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-[0_1px_3px_hsl(0_0%_0%/0.25)]"
            >
              <span className="text-primary">{s.icon}</span>
              <span className="text-sm font-semibold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* поиск и фильтры */}
      <div className="space-y-3">
        {/* поиск */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Поиск тренировки..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* фильтр по виду спорта */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium border transition-all duration-150",
              filter === 'all'
                ? "bg-primary text-primary-foreground border-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
          >
            Все
          </button>
          {(['swim', 'bike', 'run', 'strength'] as SportType[]).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium border transition-all duration-150",
                filter === s
                  ? `${sportColors[s]} border-transparent`
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              )}
            >
              <SportIcon sport={s} className="h-3.5 w-3.5" /> {sportLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* список тренировок */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl border border-border bg-card animate-pulse"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-6">
          {(grouped ?? [{ sport: filter as SportType, items: filtered }]).map((group) => (
            <div key={group.sport}>
              {/* заголовок секции — только в режиме группировки */}
              {grouped && (
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-base",
                    sportIconBg[group.sport]
                  )}>
                    <SportIcon sport={group.sport} className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-sm font-semibold text-foreground">
                    {sportLabels[group.sport]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {group.items.length} {group.items.length === 1 ? 'тренировка' : group.items.length < 5 ? 'тренировки' : 'тренировок'}
                  </span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
              )}

              <div className="space-y-2">
                {group.items.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <Link to={`/workouts/${w.id}`} className="group block">
                      <div className={cn(
                        "flex items-center gap-4 rounded-xl border border-l-[3px] bg-card px-4 py-3.5",
                        "shadow-[0_1px_3px_hsl(0_0%_0%/0.25)] hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.4)]",
                        "transition-all duration-150 hover:-translate-y-px",
                        sportAccent[w.sport]
                      )}>
                        {/* иконка */}
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
                          sportIconBg[w.sport]
                        )}>
                          <SportIcon sport={w.sport} className="h-4 w-4" />
                        </div>

                        {/* название и мета */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{w.title}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">{formatDate(w.date)}</span>
                            <span className="text-muted-foreground/40 text-xs">·</span>
                            <span className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5",
                              w.source === 'strava'
                                ? "bg-[#FC4C02]/10 text-[#FC4C02]"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {w.source === 'strava' ? <><Zap className="h-2.5 w-2.5" /> Strava</> : <><PenLine className="h-2.5 w-2.5" /> Вручную</>}
                            </span>
                          </div>
                        </div>

                        {/* показатели */}
                        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDuration(w.duration)}
                          </span>
                          {w.distance && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {w.distance} км
                            </span>
                          )}
                        </div>

                        {/* кнопки */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={e => openEdit(w, e)}
                            className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
                            title="Редактировать"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={e => handleDelete(w.id, e)}
                            className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                            title="Удалить"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* пусто */
        <motion.div
          className="flex flex-col items-center justify-center py-24 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Dumbbell className="h-8 w-8 text-primary/60" />
          </div>
          <p className="font-display text-lg font-semibold">
            {workouts.length === 0 ? 'Нет тренировок' : 'Ничего не найдено'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {workouts.length === 0
              ? 'Добавьте первую тренировку вручную или синхронизируйте Strava'
              : 'Попробуйте изменить поиск или фильтр'}
          </p>
          {workouts.length === 0 && (
            <Button className="mt-5 gap-2" onClick={openModal}>
              <Plus className="h-4 w-4" /> Добавить тренировку
            </Button>
          )}
        </motion.div>
      )}

      {/* модальное окно */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 px-4 pb-0 sm:pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-[0_8px_40px_hsl(0_0%_0%/0.6)] max-h-[92vh] overflow-y-auto"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
            >
              {/* шапка модального окна */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                  <h3 className="font-display text-base font-semibold">
                    {editingId ? 'Редактировать тренировку' : 'Новая тренировка'}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {editingId && (
                    <button
                      onClick={() => handleDelete(editingId)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Удалить тренировку"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={closeModal}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* название */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Название
                  </Label>
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Например: Утренний бег"
                    className="mt-1.5"
                    autoFocus
                  />
                </div>

                {/* вид спорта */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Вид спорта
                  </Label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {SPORTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sport: s }))}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border py-3 text-center transition-all duration-150",
                          form.sport === s
                            ? `${sportColors[s]} border-transparent shadow-sm`
                            : "border-border hover:bg-accent hover:border-border/80"
                        )}
                      >
                        <SportIcon sport={s} className="h-4 w-4" />
                        <span className={cn(
                          "text-[10px] font-medium leading-tight",
                          form.sport === s ? "opacity-90" : "text-muted-foreground"
                        )}>
                          {sportLabels[s]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* дата и длительность */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Длительность, мин
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* дистанция */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Дистанция, км
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={form.distance}
                    onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                    placeholder="необязательно"
                    className="mt-1.5"
                  />
                </div>

                {/* заметки */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Заметки
                  </Label>
                  <Input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Комментарий к тренировке..."
                    className="mt-1.5"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-destructive">{formError}</p>
                )}

                {/* кнопки сохранения */}
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>
                    Отмена
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? 'Сохранение...' : editingId ? 'Сохранить' : <><Plus className="h-4 w-4" /> Добавить</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
