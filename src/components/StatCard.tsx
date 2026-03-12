import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard = ({ title, value, subtitle, icon, className, trend }: StatCardProps) => (
  <div className={cn(
    "rounded-xl border border-border bg-card p-4 lg:p-5 transition-all duration-150",
    "hover:border-border/60 hover:bg-[hsl(220_20%_11%)]",
    "shadow-[0_1px_4px_hsl(0_0%_0%/0.35)]",
    className
  )}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-1.5 text-2xl font-bold font-display text-foreground leading-none">{value}</p>
        {subtitle && (
          <p className={cn("mt-1.5 text-xs",
            trend === 'up' ? 'text-bike' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
    </div>
  </div>
);
