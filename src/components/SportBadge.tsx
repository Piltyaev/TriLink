import { sportColors, sportLabels, type SportType } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface SportBadgeProps {
  sport: SportType;
  size?: 'sm' | 'md';
}

export const SportBadge = ({ sport, size = 'sm' }: SportBadgeProps) => (
  <span className={cn(
    "inline-flex items-center rounded-full font-medium",
    size === 'sm' ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
    sportColors[sport]
  )}>
    {sportLabels[sport]}
  </span>
);
