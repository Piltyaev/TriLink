import {
  Shield, Star, Award, Gem, Zap, Crown,
  Flag, Flame, Target, Waves, Bike, PersonStanding,
  BadgeCheck, Mountain, Dumbbell, Sun, ThumbsDown,
  MinusCircle, XCircle, AlertTriangle, TrendingDown,
  BedDouble,
  type LucideProps,
} from "lucide-react";
import type { FC } from "react";
import type { SportType } from "@/data/mockData";

const MAP: Record<string, FC<LucideProps>> = {
  Shield, Star, Award, Gem, Zap, Crown,
  Flag, Flame, Target, Waves, Bike, PersonStanding,
  BadgeCheck, Mountain, Dumbbell, Sun, ThumbsDown,
  MinusCircle, XCircle, AlertTriangle, TrendingDown,
};

export function getIcon(name: string): FC<LucideProps> {
  return MAP[name] ?? Shield;
}

const SPORT_ICONS: Record<SportType, FC<LucideProps>> = {
  swim:     Waves,
  bike:     Bike,
  run:      PersonStanding,
  strength: Dumbbell,
  rest:     BedDouble,
};

export function SportIcon({ sport, className }: { sport: SportType; className?: string }) {
  const Icon = SPORT_ICONS[sport] ?? Waves;
  return <Icon className={className ?? "h-4 w-4"} />;
}
