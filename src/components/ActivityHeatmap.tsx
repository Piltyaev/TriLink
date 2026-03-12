import { type Workout } from "@/data/mockData";
import { cn, toLocalISO } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  workouts: Workout[];
}

const MONTHS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const WEEKS = 15;

function getTier(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes === 0) return 0;
  if (minutes < 30)  return 1;
  if (minutes < 60)  return 2;
  if (minutes < 90)  return 3;
  return 4;
}

const tierStyle: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-muted/50',
  1: 'bg-primary/20',
  2: 'bg-primary/45',
  3: 'bg-primary/70',
  4: 'bg-primary',
};

function formatLabel(d: Date, minutes: number): string {
  const days = ['вс','пн','вт','ср','чт','пт','сб'];
  const day = days[d.getDay()];
  const date = `${d.getDate()} ${MONTHS_RU[d.getMonth()]}`;
  if (minutes === 0) return `${day}, ${date} — нет тренировок`;
  return `${day}, ${date} — ${minutes} мин`;
}

export function ActivityHeatmap({ workouts }: Props) {
  // Aggregate duration per date
  const durationByDate = new Map<string, number>();
  workouts.forEach(w => {
    durationByDate.set(w.date, (durationByDate.get(w.date) ?? 0) + w.duration);
  });

  // Find grid start: Monday of (today − 14 weeks)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon … 6=Sun
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - dayOfWeek - (WEEKS - 1) * 7);

  // Build cells (column-major: week 0..14 × day 0..6 Mon→Sun)
  type Cell = { iso: string; date: Date; tier: 0|1|2|3|4; minutes: number; isFuture: boolean };
  const grid: Cell[][] = [];
  const monthLabels: (string | null)[] = [];

  for (let w = 0; w < WEEKS; w++) {
    const week: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + w * 7 + d);
      const iso = toLocalISO(date);
      const isFuture = date > today;
      const minutes = isFuture ? 0 : (durationByDate.get(iso) ?? 0);
      week.push({ iso, date, tier: getTier(minutes), minutes, isFuture });
    }
    // Show month label when week starts a new month
    const firstDay = week[0].date;
    const prevWeekFirst = w > 0 ? grid[w - 1][0].date : null;
    const showMonth = !prevWeekFirst || firstDay.getMonth() !== prevWeekFirst.getMonth();
    monthLabels.push(showMonth ? MONTHS_RU[firstDay.getMonth()] : null);
    grid.push(week);
  }

  const activeDays = new Set(
    workouts.filter(w => new Date(w.date) >= gridStart).map(w => w.date)
  ).size;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Активность за 15 недель</h3>
        <span className="text-xs text-muted-foreground">{activeDays} активных дней</span>
      </div>

      <div className="flex gap-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[4px] pt-6 shrink-0">
          {['Пн','','Ср','','Пт','',''].map((label, i) => (
            <div key={i} className="h-[18px] flex items-center">
              <span className="text-[10px] text-muted-foreground/60 leading-none w-4">{label}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-[4px] mb-1.5 h-5">
            {grid.map((_, w) => (
              <div key={w} className="w-[18px] shrink-0">
                {monthLabels[w] && (
                  <span className="text-[10px] text-muted-foreground/70 leading-none whitespace-nowrap">
                    {monthLabels[w]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="flex gap-[4px]">
            {grid.map((week, w) => (
              <div key={w} className="flex flex-col gap-[4px]">
                {week.map((cell, d) => (
                  <Tooltip key={d}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'h-[18px] w-[18px] rounded-[3px] transition-transform duration-100 hover:scale-[1.3] cursor-default shrink-0',
                          tierStyle[cell.tier],
                          cell.isFuture && 'opacity-20'
                        )}
                      />
                    </TooltipTrigger>
                    {!cell.isFuture && (
                      <TooltipContent side="top" className="text-xs">
                        {formatLabel(cell.date, cell.minutes)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-4 justify-end">
        <span className="text-[11px] text-muted-foreground">Меньше</span>
        {([0, 1, 2, 3, 4] as const).map(t => (
          <div key={t} className={cn('h-[14px] w-[14px] rounded-[3px]', tierStyle[t])} />
        ))}
        <span className="text-[11px] text-muted-foreground">Больше</span>
      </div>
    </div>
  );
}
