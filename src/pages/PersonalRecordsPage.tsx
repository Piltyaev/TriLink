import { useEffect, useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { type Workout, mapWorkout, sportLabels, sportIconBg, sportColors, type SportType, SPORTS } from "@/data/mockData";
import { SportIcon } from "@/lib/iconMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award, Plus, Pencil, Trash2, X, Timer, MapPin, Heart, Flame, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn, dateISO } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersonalRecord {
  id: string;
  sport: SportType;
  discipline: string;
  result: string;
  date: string;
  notes?: string;
}

interface RecordForm {
  sport: SportType;
  discipline: string;
  result: string;
  date: string;
  notes: string;
}

const emptyForm = (): RecordForm => ({
  sport: 'run',
  discipline: '',
  result: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
});

function mapRecord(row: Record<string, unknown>): PersonalRecord {
  return {
    id:         row.id         as string,
    sport:      row.sport      as SportType,
    discipline: row.discipline as string,
    result:     row.result     as string,
    date:       row.date       as string,
    notes:      row.notes      != null ? row.notes as string : undefined,
  };
}

function parsePace(pace: string): number {
  const [m, s] = pace.split(':').map(Number);
  return (isNaN(m) ? 999 : m) * 60 + (isNaN(s) ? 0 : s);
}

const GROUP_ORDER: SportType[] = ['swim', 'bike', 'run', 'strength', 'rest'];

// ── Component ─────────────────────────────────────────────────────────────────

export default function PersonalRecordsPage() {
  usePageTitle('Рекорды');
  const { user } = useAuth();

  const [records,   setRecords]   = useState<PersonalRecord[]>([]);
  const [workouts,  setWorkouts]  = useState<Workout[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<SportType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form,      setForm]      = useState<RecordForm>(emptyForm());
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);

  const load = () => {
    if (!user) return;
    Promise.all([
      supabase
        .from('personal_records' as never)
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('workouts')
        .select('id,title,sport,date,duration,source,distance,avg_hr,max_hr,avg_pace,calories,tss,rpe,notes')
        .eq('user_id', user.id)
        .gte('date', dateISO(730)),
    ]).then(([recRes, woRes]) => {
      const r = recRes as { data: Record<string, unknown>[] | null };
      setRecords((r.data || []).map(mapRecord));
      setWorkouts(((woRes.data || []) as Record<string, unknown>[]).map(mapWorkout));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  // ── Auto records from workouts ──────────────────────────────────────────────

  const autoRecords = useMemo(() => {
    if (workouts.length === 0) return [];
    const maxDuration = workouts.reduce((a, b) => a.duration > b.duration ? a : b);
    const withDistance = workouts.filter(w => w.distance && w.distance > 0);
    const maxDistance  = withDistance.length ? withDistance.reduce((a, b) => (a.distance ?? 0) > (b.distance ?? 0) ? a : b) : null;
    const withPace     = workouts.filter(w => w.avgPace);
    const bestPace     = withPace.length ? withPace.reduce((a, b) => parsePace(a.avgPace!) < parsePace(b.avgPace!) ? a : b) : null;
    const withHr       = workouts.filter(w => w.maxHr);
    const maxHr        = withHr.length ? withHr.reduce((a, b) => (a.maxHr ?? 0) > (b.maxHr ?? 0) ? a : b) : null;
    const withCal      = workouts.filter(w => w.calories);
    const maxCal       = withCal.length ? withCal.reduce((a, b) => (a.calories ?? 0) > (b.calories ?? 0) ? a : b) : null;

    const rows: { icon: React.ReactNode; label: string; value: string; sub: string; sport: SportType }[] = [];

    rows.push({
      icon: <Timer className="h-4 w-4" />,
      label: 'Самая длинная тренировка',
      value: `${maxDuration.duration} мин`,
      sub: `${maxDuration.title} · ${maxDuration.date}`,
      sport: maxDuration.sport,
    });
    if (maxDistance) rows.push({
      icon: <MapPin className="h-4 w-4" />,
      label: 'Самая длинная дистанция',
      value: `${maxDistance.distance} км`,
      sub: `${maxDistance.title} · ${maxDistance.date}`,
      sport: maxDistance.sport,
    });
    if (bestPace) rows.push({
      icon: <Zap className="h-4 w-4" />,
      label: 'Лучший темп',
      value: `${bestPace.avgPace}/км`,
      sub: `${bestPace.title} · ${bestPace.date}`,
      sport: bestPace.sport,
    });
    if (maxHr) rows.push({
      icon: <Heart className="h-4 w-4" />,
      label: 'Макс. пульс',
      value: `${maxHr.maxHr} уд/мин`,
      sub: `${maxHr.title} · ${maxHr.date}`,
      sport: maxHr.sport,
    });
    if (maxCal) rows.push({
      icon: <Flame className="h-4 w-4" />,
      label: 'Макс. калорий',
      value: `${maxCal.calories} ккал`,
      sub: `${maxCal.title} · ${maxCal.date}`,
      sport: maxCal.sport,
    });
    return rows;
  }, [workouts]);

  // ── Filtered + grouped ──────────────────────────────────────────────────────

  const filtered = records.filter(r => filter === 'all' || r.sport === filter);
  const grouped = GROUP_ORDER
    .map(sport => ({ sport, items: filtered.filter(r => r.sport === sport) }))
    .filter(g => g.items.length > 0);

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const closeModal = () => { setShowModal(false); setEditingId(null); setForm(emptyForm()); setFormError(''); };
  const openAdd    = () => { setEditingId(null); setForm(emptyForm()); setFormError(''); setShowModal(true); };
  const openEdit   = (r: PersonalRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(r.id);
    setForm({ sport: r.sport, discipline: r.discipline, result: r.result, date: r.date, notes: r.notes || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.discipline.trim()) { setFormError('Введите дисциплину'); return; }
    if (!form.result.trim())     { setFormError('Введите результат'); return; }
    if (!form.date)              { setFormError('Выберите дату'); return; }
    setFormError('');
    setSaving(true);

    const payload = {
      user_id:    user.id,
      sport:      form.sport,
      discipline: form.discipline.trim(),
      result:     form.result.trim(),
      date:       form.date,
      notes:      form.notes.trim() || null,
    };

    if (editingId) {
      const { error } = await (supabase.from('personal_records' as never) as ReturnType<typeof supabase.from>)
        .update(payload as never).eq('id', editingId).eq('user_id', user.id);
      if (error) { toast.error(`Ошибка: ${(error as { message: string }).message}`); setSaving(false); return; }
      toast.success('Рекорд обновлён');
    } else {
      const { error } = await (supabase.from('personal_records' as never) as ReturnType<typeof supabase.from>)
        .insert(payload as never);
      if (error) { toast.error(`Ошибка: ${(error as { message: string }).message}`); setSaving(false); return; }
      toast.success('Рекорд добавлен');
    }
    setSaving(false);
    closeModal();
    load();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return;
    const { error } = await (supabase.from('personal_records' as never) as ReturnType<typeof supabase.from>)
      .delete().eq('id', id).eq('user_id', user.id);
    if (error) { toast.error('Ошибка удаления'); return; }
    toast.success('Рекорд удалён');
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Личные рекорды
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ваши лучшие результаты</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      {/* Auto records */}
      {!loading && autoRecords.length > 0 && (
        <motion.div
          className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.3)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-display text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Рекорды из тренировок
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {autoRecords.map((r, i) => (
              <motion.div
                key={r.label}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/30 px-4 py-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base", sportIconBg[r.sport])}>
                  <SportIcon sport={r.sport} className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{r.value}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate">{r.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium border transition-all duration-150",
            filter === 'all'
              ? "bg-primary text-primary-foreground border-transparent shadow-sm"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Все
        </button>
        {SPORTS.filter(s => s !== 'rest').map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium border transition-all duration-150",
              filter === s
                ? `${sportColors[s]} border-transparent`
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <SportIcon sport={s} className="h-3.5 w-3.5" /> {sportLabels[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl border border-border bg-card animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-24 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Award className="h-8 w-8 text-primary/60" />
          </div>
          <p className="font-display text-lg font-semibold">
            {records.length === 0 ? 'Нет рекордов' : 'Ничего не найдено'}
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {records.length === 0
              ? 'Добавьте свой первый личный рекорд — лучший результат на дистанции или упражнении'
              : 'Попробуйте изменить фильтр'}
          </p>
          {records.length === 0 && (
            <Button className="mt-5 gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Добавить рекорд
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.sport}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-base", sportIconBg[group.sport])}>
                  <SportIcon sport={group.sport} className="h-4 w-4" />
                </div>
                <h2 className="font-display text-sm font-semibold">{sportLabels[group.sport]}</h2>
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <div className="space-y-2">
                {group.items.map((r, i) => (
                  <motion.div
                    key={r.id}
                    className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-[0_1px_3px_hsl(0_0%_0%/0.2)] hover:shadow-[0_2px_8px_hsl(0_0%_0%/0.35)] transition-all"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg", sportIconBg[r.sport])}>
                      <SportIcon sport={r.sport} className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{r.discipline}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.date}{r.notes ? ` · ${r.notes}` : ''}</p>
                    </div>
                    <div className="text-right shrink-0 mr-2">
                      <p className="font-display text-base font-bold text-foreground">{r.result}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => openEdit(r, e)}
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={e => handleDelete(r.id, e)}
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                  <h3 className="font-display text-base font-semibold">
                    {editingId ? 'Редактировать рекорд' : 'Новый рекорд'}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {editingId && (
                    <button
                      onClick={() => { handleDelete(editingId); closeModal(); }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
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

                {/* Sport */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Вид спорта</Label>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {SPORTS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sport: s }))}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border py-3 text-center transition-all",
                          form.sport === s
                            ? `${sportColors[s]} border-transparent shadow-sm`
                            : "border-border hover:bg-accent"
                        )}
                      >
                        <SportIcon sport={s} className="h-4 w-4" />
                        <span className={cn("text-[10px] font-medium", form.sport === s ? "opacity-90" : "text-muted-foreground")}>
                          {sportLabels[s]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discipline */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Дисциплина</Label>
                  <Input
                    value={form.discipline}
                    onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))}
                    placeholder="Напр.: 100м кроль, 5 км бег"
                    className="mt-1.5"
                    autoFocus
                  />
                </div>

                {/* Result + Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Результат</Label>
                    <Input
                      value={form.result}
                      onChange={e => setForm(f => ({ ...f, result: e.target.value }))}
                      placeholder="1:05.3, 22:30, 95 кг"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Дата</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Заметки</Label>
                  <Input
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="необязательно"
                    className="mt-1.5"
                  />
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={closeModal}>Отмена</Button>
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
