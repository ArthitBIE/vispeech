import { describe, it, expect } from "vitest";
import { computeStreak, dateKey } from "../streak";

describe("computeStreak", () => {
  it("returns 0 for empty array", () => {
    const result = computeStreak([], new Date("2025-01-15"));
    expect(result.streak).toBe(0);
    expect(result.startDate).toBeNull();
  });

  it("counts consecutive days ending today", () => {
    // Today practiced: streak = 1
    const today = new Date("2025-01-15");
    const result = computeStreak([dateKey(today)], today);
    expect(result.streak).toBe(1);
    expect(result.startDate).toEqual(today);
  });

  it("counts consecutive days ending yesterday (today not practiced)", () => {
    // Yesterday practiced, today not: streak = 1 (today doesn't reset)
    const today = new Date("2025-01-15");
    const yesterday = new Date("2025-01-14");
    const result = computeStreak([dateKey(yesterday)], today);
    expect(result.streak).toBe(1);
    expect(result.startDate).toEqual(yesterday);
  });

  it("counts multi-day streak", () => {
    // 3 consecutive days ending today
    const today = new Date("2025-01-15");
    const yesterday = new Date("2025-01-14");
    const dayBefore = new Date("2025-01-13");
    const result = computeStreak(
      [dateKey(today), dateKey(yesterday), dateKey(dayBefore)],
      today
    );
    expect(result.streak).toBe(3);
    expect(result.startDate).toEqual(dayBefore);
  });

  it("breaks on gap", () => {
    // Gap between Jan 15 and Jan 13 -> streak = 1 (only today)
    const today = new Date("2025-01-15");
    const twoDaysAgo = new Date("2025-01-13");
    const result = computeStreak([dateKey(today), dateKey(twoDaysAgo)], today);
    expect(result.streak).toBe(1);
    expect(result.startDate).toEqual(today);
  });

  it("handles unsorted input", () => {
    const today = new Date("2025-01-15");
    const yesterday = new Date("2025-01-14");
    const dayBefore = new Date("2025-01-13");
    // Input in random order
    const result = computeStreak(
      [dateKey(dayBefore), dateKey(today), dateKey(yesterday)],
      today
    );
    expect(result.streak).toBe(3);
    expect(result.startDate).toEqual(dayBefore);
  });

  it("streak continues across month boundary", () => {
    const jan31 = new Date("2025-01-31");
    const feb1 = new Date("2025-02-01");
    const feb2 = new Date("2025-02-02");
    const result = computeStreak(
      [dateKey(jan31), dateKey(feb1), dateKey(feb2)],
      feb2
    );
    expect(result.streak).toBe(3);
    expect(result.startDate).toEqual(jan31);
  });

  it("streak continues across year boundary", () => {
    const dec31 = new Date("2024-12-31");
    const jan1 = new Date("2025-01-01");
    const result = computeStreak([dateKey(dec31), dateKey(jan1)], jan1);
    expect(result.streak).toBe(2);
    expect(result.startDate).toEqual(dec31);
  });

  it("today not practiced but yesterday is -> streak=1", () => {
    // Key behavior: today unpracticed doesn't reset if yesterday was practiced
    const today = new Date("2025-01-15");
    const yesterday = new Date("2025-01-14");
    const result = computeStreak([dateKey(yesterday)], today);
    expect(result.streak).toBe(1);
    expect(result.startDate).toEqual(yesterday);
  });

  it("no streak if no recent practice", () => {
    const today = new Date("2025-01-15");
    const weekAgo = new Date("2025-01-08");
    const result = computeStreak([dateKey(weekAgo)], today);
    expect(result.streak).toBe(0);
    expect(result.startDate).toBeNull();
  });
});
