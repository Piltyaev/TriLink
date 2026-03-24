import { describe, it, expect } from "vitest";
import { getRank, getRankProgress, getRankByCount, getTotalMinutes, RANKS } from "@/lib/ranks";
import type { Workout } from "@/data/mockData";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeWorkout(duration: number): Workout {
  return {
    id: String(Math.random()),
    title: "Test",
    sport: "run",
    date: "2025-01-01",
    duration,
    source: "manual",
  };
}

// ── getRank ───────────────────────────────────────────────────────────────────

describe("getRank", () => {
  it("returns minimum rank (Новичок) for 0 minutes", () => {
    const rank = getRank(0);
    expect(rank.id).toBe("rookie");
    expect(rank.label).toBe("Новичок");
  });

  it("returns Новичок for minutes below the first threshold (e.g. 299)", () => {
    const rank = getRank(299);
    expect(rank.id).toBe("rookie");
  });

  it("returns Любитель at exactly 300 minutes", () => {
    const rank = getRank(300);
    expect(rank.id).toBe("amateur");
  });

  it("returns Атлет at exactly 1000 minutes", () => {
    const rank = getRank(1000);
    expect(rank.id).toBe("athlete");
  });

  it("returns Профи at exactly 3000 minutes", () => {
    const rank = getRank(3000);
    expect(rank.id).toBe("pro");
  });

  it("returns Элита at exactly 6000 minutes", () => {
    const rank = getRank(6000);
    expect(rank.id).toBe("elite");
  });

  it("returns maximum rank (Легенда) at 10000 minutes", () => {
    const rank = getRank(10000);
    expect(rank.id).toBe("legend");
    expect(rank.label).toBe("Легенда");
  });

  it("returns maximum rank (Легенда) for very large values (9999999)", () => {
    const rank = getRank(9999999);
    expect(rank.id).toBe("legend");
  });
});

// ── getRankProgress ───────────────────────────────────────────────────────────

describe("getRankProgress", () => {
  it("returns progress 0 at rank floor (0 minutes)", () => {
    const { rank, next, progress } = getRankProgress(0);
    expect(rank.id).toBe("rookie");
    expect(next).not.toBeNull();
    expect(progress).toBe(0);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it("returns progress between 0 and 100 for intermediate values", () => {
    const { progress } = getRankProgress(500);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });

  it("returns 100% progress and no next rank at max rank", () => {
    const { rank, next, progress } = getRankProgress(10000);
    expect(rank.id).toBe("legend");
    expect(next).toBeNull();
    expect(progress).toBe(100);
  });

  it("progress is exactly 50% at midpoint between two ranks", () => {
    // rookie: 0, amateur: 300 → midpoint = 150
    const { progress } = getRankProgress(150);
    expect(progress).toBe(50);
  });

  it("progress increases as minutes increase within a rank", () => {
    const { progress: p1 } = getRankProgress(100);
    const { progress: p2 } = getRankProgress(200);
    expect(p2).toBeGreaterThan(p1);
  });

  it("next rank is the immediately higher rank", () => {
    const { rank, next } = getRankProgress(300);
    expect(rank.id).toBe("amateur");
    expect(next?.id).toBe("athlete");
  });
});

// ── getRankByCount ────────────────────────────────────────────────────────────

describe("getRankByCount", () => {
  it("returns Новичок for 0 workouts", () => {
    expect(getRankByCount(0).id).toBe("rookie");
  });

  it("returns Любитель for 5 workouts", () => {
    expect(getRankByCount(5).id).toBe("amateur");
  });

  it("returns Атлет for 20 workouts", () => {
    expect(getRankByCount(20).id).toBe("athlete");
  });

  it("returns Профи for 50 workouts", () => {
    expect(getRankByCount(50).id).toBe("pro");
  });

  it("returns Элита for 100 workouts", () => {
    expect(getRankByCount(100).id).toBe("elite");
  });

  it("returns Легенда for 200 workouts", () => {
    expect(getRankByCount(200).id).toBe("legend");
  });

  it("returns Легенда for very high count", () => {
    expect(getRankByCount(9999).id).toBe("legend");
  });
});

// ── getTotalMinutes ───────────────────────────────────────────────────────────

describe("getTotalMinutes", () => {
  it("returns 0 for empty array", () => {
    expect(getTotalMinutes([])).toBe(0);
  });

  it("sums durations correctly", () => {
    const workouts = [makeWorkout(60), makeWorkout(90), makeWorkout(30)];
    expect(getTotalMinutes(workouts)).toBe(180);
  });

  it("works with a single workout", () => {
    expect(getTotalMinutes([makeWorkout(45)])).toBe(45);
  });
});

// ── RANKS array integrity ─────────────────────────────────────────────────────

describe("RANKS array", () => {
  it("has exactly 6 ranks", () => {
    expect(RANKS).toHaveLength(6);
  });

  it("ranks are sorted by minMinutes ascending", () => {
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i].minMinutes).toBeGreaterThan(RANKS[i - 1].minMinutes);
    }
  });

  it("first rank starts at 0 minutes", () => {
    expect(RANKS[0].minMinutes).toBe(0);
  });
});
