import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  userName: string;
  streak: number;
  weeklyMinutes: number;
  weeklyGoal?: number;
}

const QUOTES = [
  "Каждый километр — это выбор продолжать.",
  "Сила рождается там, где заканчивается комфорт.",
  "Твой лучший соперник — вчерашняя версия тебя.",
  "Не останавливайся, когда устал. Останавливайся, когда закончил.",
  "Тело достигает того, во что верит разум.",
  "Боль временна. Гордость за финиш — навсегда.",
  "Чемпионы тренируются, когда другие отдыхают.",
  "Каждая тренировка — инвестиция в себя.",
  "Ты уже опередил всех, кто остался дома.",
  "Прогресс, а не совершенство.",
  "Маленькие шаги каждый день — великие результаты.",
  "Триатлон — это не вид спорта. Это образ жизни.",
  "Дисциплина — это то, что остаётся, когда мотивация уходит.",
  "Финишная черта — это только начало следующего вызова.",
  "Каждый подъём заканчивается спуском. Просто крути педали.",
  "Плавай, крути, беги — повторяй до победы.",
  "Тяжело в тренировке — легко на гонке.",
  "Разум сдаётся раньше тела. Не слушай его.",
  "Гонка начинается там, где хочется остановиться.",
  "Выносливость — это искусство терпеть чуть дольше остальных.",
  "Плыви глубже, езди дальше, беги быстрее.",
  "Лучший день для старта — сегодня.",
  "Слабость — выбор. Сила — тоже выбор.",
  "Сделай сегодня то, о чём завтра будешь гордиться.",
];

function pluralDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return 'дней';
  if (last === 1) return 'день';
  if (last >= 2 && last <= 4) return 'дня';
  return 'дней';
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "Поздняя ночь";
  if (h < 12) return "Доброе утро";
  if (h < 17) return "Добрый день";
  if (h < 22) return "Добрый вечер";
  return "Поздний вечер";
}

export function DashboardHeader({ userName, streak, weeklyMinutes, weeklyGoal = 300 }: Props) {
  const firstName = userName.split(' ')[0] || 'Атлет';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const pct = Math.min(Math.round((weeklyMinutes / weeklyGoal) * 100), 100);
  const goalReached = pct >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Greeting + badges */}
      <div className="flex flex-wrap items-center gap-3 mb-1.5">
        <h1 className="font-display text-2xl font-bold">
          {getGreeting()}, {firstName}!
        </h1>
        {streak > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-run/20 text-run-foreground px-2.5 py-0.5 text-sm font-semibold border border-run/20">
            <Flame className="h-3.5 w-3.5" />
            {streak} {pluralDays(streak)}
          </span>
        )}
      </div>

      {/* Quote */}
      <p className="text-sm text-muted-foreground italic mb-4">
        «{quote}»
      </p>

      {/* Weekly goal progress */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          goalReached ? "bg-bike/15 text-bike" : "bg-primary/10 text-primary"
        )}>
          <Target className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Цель недели
            </span>
            <span className={cn("text-xs font-semibold", goalReached ? "text-bike" : "text-foreground")}>
              {weeklyMinutes} / {weeklyGoal} мин
              {goalReached && " ✓"}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={cn("h-full rounded-full", goalReached ? "bg-bike" : "bg-primary")}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
        <span className={cn(
          "text-sm font-bold shrink-0",
          goalReached ? "text-bike" : "text-foreground"
        )}>
          {pct}%
        </span>
      </div>
    </motion.div>
  );
}
