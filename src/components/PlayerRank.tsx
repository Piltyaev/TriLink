import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/ranks";
import { getIcon } from "@/lib/iconMap";

interface Props {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showGlow?: boolean;
}

export function PlayerRank({ rank, size = 'md', showLabel = true, showGlow = false }: Props) {
  const iconSize = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3 w-3';
  const labelSize = size === 'lg' ? 'text-sm' : 'text-xs';
  const padding   = size === 'lg' ? 'px-4 py-2 gap-2.5' : size === 'md' ? 'px-3 py-1.5 gap-2' : 'px-2 py-1 gap-1.5';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-all',
        padding,
        rank.color,
        rank.borderColor,
      )}
      style={showGlow ? { boxShadow: `0 0 12px ${rank.glowColor}` } : undefined}
    >
      {(() => { const Icon = getIcon(rank.icon); return <Icon className={iconSize} />; })()}
      {showLabel && <span className={labelSize}>{rank.label}</span>}
    </div>
  );
}
