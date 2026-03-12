import { cn } from "@/lib/utils";
import type { Rank } from "@/lib/ranks";

interface Props {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showGlow?: boolean;
}

export function PlayerRank({ rank, size = 'md', showLabel = true, showGlow = false }: Props) {
  const emojiSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base';
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
      <span className={emojiSize}>{rank.emoji}</span>
      {showLabel && <span className={labelSize}>{rank.label}</span>}
    </div>
  );
}
