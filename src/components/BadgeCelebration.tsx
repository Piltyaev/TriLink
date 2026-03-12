import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Badge } from "@/lib/badges";
import { cn } from "@/lib/utils";

const CONFETTI_COLORS = [
  '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981',
  '#f97316', '#ec4899', '#3b82f6', '#84cc16', '#fbbf24',
  '#a78bfa', '#fb923c', '#34d399', '#f472b6', '#60a5fa',
];

const SPARKS = ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '🎯', '🔥'];

interface Props {
  badge: Badge;
  onClose: () => void;
}

export function BadgeCelebration({ badge, onClose }: Props) {
  // Автозакрытие через 5 секунд
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [badge.id, onClose]);

  // Конфетти: равномерно по кругу + случайный разброс
  const particles = useMemo(() =>
    Array.from({ length: 56 }, (_, i) => {
      const angle = (i / 56) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 140 + Math.random() * 280;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - Math.random() * 120,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        w: Math.random() * 7 + 4,
        h: Math.random() * 12 + 6,
      };
    }), [badge.id]);

  // Эмодзи-искры по кругу
  const sparks = useMemo(() =>
    SPARKS.map((emoji, i) => {
      const angle = (i / SPARKS.length) * Math.PI * 2 - Math.PI / 2;
      const dist = 130 + Math.random() * 70;
      return {
        emoji,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };
    }), [badge.id]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Конфетти */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-[2px] pointer-events-none"
          style={{ left: '50%', top: '50%', width: p.w, height: p.h, background: p.color, marginLeft: -p.w / 2, marginTop: -p.h / 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, rotate: p.rot, scale: 0.6 }}
          transition={{ duration: 1.6 + Math.random() * 0.6, ease: [0.2, 0.8, 0.4, 1], delay: p.delay }}
        />
      ))}

      {/* Эмодзи-искры */}
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{ left: '50%', top: '50%' }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 1, 0], scale: [0, 1.3, 1.1, 0] }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.1 + i * 0.05 }}
        >
          {s.emoji}
        </motion.div>
      ))}

      {/* Основная карточка */}
      <motion.div
        className="relative z-10 text-center px-8 py-8 rounded-3xl border border-border/60 bg-card max-w-xs w-full mx-4 overflow-hidden"
        style={{ boxShadow: '0 0 60px hsl(var(--primary)/0.25), 0 24px 80px hsl(0 0% 0% / 0.7)' }}
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: -20 }}
        transition={{ type: 'spring', damping: 16, stiffness: 260, delay: 0.05 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Фоновый градиент-пульс */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-primary/8 pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Большой эмодзи достижения */}
        <motion.div
          className="relative text-[72px] mb-4 select-none leading-none"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: [0, 1.5, 1.1, 1], rotate: [-30, 15, -5, 0] }}
          transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        >
          {badge.emoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {/* Заголовок */}
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary mb-3">
            🎉 Новое достижение!
          </p>

          {/* Название в стиле бейджа */}
          <div className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold mb-2",
            badge.color
          )}>
            {badge.label}
          </div>

          {/* Описание */}
          <p className="text-sm text-muted-foreground mt-2 mb-6 leading-relaxed px-2">
            {badge.desc}
          </p>
        </motion.div>

        {/* Кнопка */}
        <motion.button
          className="relative w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all duration-150"
          onClick={onClose}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileTap={{ scale: 0.96 }}
        >
          Принято! 💪
        </motion.button>

        {/* Прогресс-бар автозакрытия */}
        <motion.div
          className="absolute bottom-0 left-0 h-[3px] bg-primary/50 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 5, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  );
}

// Обёртка с AnimatePresence для плавного появления/исчезновения
export function BadgeCelebrationQueue({ queue, onDismiss }: { queue: Badge[]; onDismiss: () => void }) {
  const current = queue[0] ?? null;
  return (
    <AnimatePresence mode="wait">
      {current && (
        <BadgeCelebration key={current.id} badge={current} onClose={onDismiss} />
      )}
    </AnimatePresence>
  );
}
