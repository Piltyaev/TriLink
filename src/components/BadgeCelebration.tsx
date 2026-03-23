import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Badge } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMap";

interface Props {
  badge: Badge;
  onClose: () => void;
}

export function BadgeCelebration({ badge, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [badge.id, onClose]);

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

        {/* Иконка достижения */}
        <motion.div
          className="relative mb-4 flex items-center justify-center"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: [0, 1.5, 1.1, 1], rotate: [-30, 15, -5, 0] }}
          transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        >
          {(() => { const Icon = getIcon(badge.icon); return <Icon className="h-16 w-16" />; })()}
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
