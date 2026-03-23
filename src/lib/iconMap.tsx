import {
  Shield, Star, Award, Gem, Zap, Crown,
  Flag, Flame, Target, Waves, Bike, PersonStanding,
  BadgeCheck, Mountain, Dumbbell, Sun, ThumbsDown,
  MinusCircle, XCircle, AlertTriangle, TrendingDown,
  type LucideProps,
} from "lucide-react";
import type { FC } from "react";

const MAP: Record<string, FC<LucideProps>> = {
  Shield, Star, Award, Gem, Zap, Crown,
  Flag, Flame, Target, Waves, Bike, PersonStanding,
  BadgeCheck, Mountain, Dumbbell, Sun, ThumbsDown,
  MinusCircle, XCircle, AlertTriangle, TrendingDown,
};

export function getIcon(name: string): FC<LucideProps> {
  return MAP[name] ?? Shield;
}
