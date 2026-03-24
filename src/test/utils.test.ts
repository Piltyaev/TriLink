import { describe, it, expect } from "vitest";
import { cn, formatDuration, toLocalISO, dateISO, getInitials } from "@/lib/utils";

// ── formatDuration ────────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats 0 minutes as '0м'", () => {
    expect(formatDuration(0)).toBe("0м");
  });

  it("formats minutes less than 60 without hours", () => {
    expect(formatDuration(45)).toBe("45м");
    expect(formatDuration(1)).toBe("1м");
    expect(formatDuration(59)).toBe("59м");
  });

  it("formats exactly 60 minutes as '1ч 0м'", () => {
    expect(formatDuration(60)).toBe("1ч 0м");
  });

  it("formats 90 minutes as '1ч 30м'", () => {
    expect(formatDuration(90)).toBe("1ч 30м");
  });

  it("formats 120 minutes as '2ч 0м'", () => {
    expect(formatDuration(120)).toBe("2ч 0м");
  });

  it("formats 125 minutes as '2ч 5м'", () => {
    expect(formatDuration(125)).toBe("2ч 5м");
  });

  it("handles large values (300 minutes = 5h)", () => {
    expect(formatDuration(300)).toBe("5ч 0м");
  });
});

// ── toLocalISO ────────────────────────────────────────────────────────────────

describe("toLocalISO", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2025, 0, 15); // Jan 15 2025 local
    expect(toLocalISO(d)).toBe("2025-01-15");
  });

  it("pads month and day with leading zeros", () => {
    const d = new Date(2025, 2, 5); // Mar 5 local
    expect(toLocalISO(d)).toBe("2025-03-05");
  });

  it("handles December (month 11)", () => {
    const d = new Date(2025, 11, 31);
    expect(toLocalISO(d)).toBe("2025-12-31");
  });

  it("returns a string of length 10", () => {
    const d = new Date(2025, 5, 1);
    expect(toLocalISO(d)).toHaveLength(10);
  });
});

// ── dateISO ───────────────────────────────────────────────────────────────────

describe("dateISO", () => {
  it("returns a YYYY-MM-DD formatted string", () => {
    const result = dateISO(0);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns today when daysAgo is 0", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(dateISO(0)).toBe(today);
  });

  it("returns a date in the past for positive daysAgo", () => {
    const result = dateISO(7);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    expect(result).toBe(sevenDaysAgo.toISOString().split("T")[0]);
  });

  it("date is earlier than today for daysAgo > 0", () => {
    const today = dateISO(0);
    const past  = dateISO(1);
    expect(past < today).toBe(true);
  });
});

// ── getInitials ───────────────────────────────────────────────────────────────

describe("getInitials", () => {
  it("extracts initials from a full name", () => {
    expect(getInitials("Ivan Petrov")).toBe("IP");
  });

  it("handles single-word name", () => {
    expect(getInitials("Ivan")).toBe("I");
  });

  it("falls back to email when name is null", () => {
    expect(getInitials(null, "user@example.com")).toBe("U");
  });

  it("falls back to email when name is empty string", () => {
    expect(getInitials("", "bob@test.com")).toBe("B");
  });

  it("returns 'U' when both name and email are null/undefined", () => {
    expect(getInitials(null, null)).toBe("U");
    expect(getInitials(undefined, undefined)).toBe("U");
  });

  it("returns at most 2 characters", () => {
    expect(getInitials("Ivan Aleksey Petrov")).toHaveLength(2);
  });

  it("converts to uppercase", () => {
    expect(getInitials("ivan petrov")).toBe("IP");
  });
});

// ── cn ────────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("a", "b");
    expect(result).toBe("a b");
  });

  it("deduplicates tailwind classes (last one wins)", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const active = true;
    const result = cn("base", active && "active", !active && "inactive");
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("inactive");
  });

  it("ignores falsy values", () => {
    const result = cn("a", false, null, undefined, "b");
    expect(result).toBe("a b");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
