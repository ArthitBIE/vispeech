import { describe, it, expect } from "vitest";
import { dedupeByBestScore, type PracticeResult } from "../practice-summary";

function makeResult(
  word: string,
  totalScore: number,
  overrides: Partial<PracticeResult> = {}
): PracticeResult {
  return {
    word,
    phonetic: "p",
    viseme_group: "g",
    visual_score: 0.5,
    audio_score: 0.5,
    total_score: totalScore,
    attempt_number: 1,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("dedupeByBestScore", () => {
  it("keeps the highest total_score per word", () => {
    const input = [
      makeResult("ยิ้ม", 0.6, { created_at: "2024-01-01T00:00:00Z" }),
      makeResult("ยิ้ม", 0.9, { created_at: "2024-01-01T01:00:00Z" }),
      makeResult("ยิ้ม", 0.4, { created_at: "2024-01-01T02:00:00Z" }),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(1);
    expect(output[0].word).toBe("ยิ้ม");
    expect(output[0].total_score).toBe(0.9);
  });

  it("preserves first-occurrence order when deduping", () => {
    const input = [
      makeResult("กิน", 0.8, { created_at: "2024-01-01T00:00:00Z" }),
      makeResult("นอน", 0.7, { created_at: "2024-01-01T01:00:00Z" }),
      makeResult("กิน", 0.6, { created_at: "2024-01-01T02:00:00Z" }),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(2);
    expect(output[0].word).toBe("กิน");
    expect(output[1].word).toBe("นอน");
  });

  it("keeps earlier record on tied scores", () => {
    const input = [
      makeResult("เดิน", 0.5, { created_at: "2024-01-01T00:00:00Z" }),
      makeResult("เดิน", 0.5, { created_at: "2024-01-01T01:00:00Z" }),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(1);
    expect(output[0].created_at).toBe("2024-01-01T00:00:00Z");
  });

  it("returns all unique words when no duplicates", () => {
    const input = [
      makeResult("กิน", 0.8),
      makeResult("นอน", 0.7),
      makeResult("เดิน", 0.6),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(3);
    expect(output.map((r) => r.word)).toEqual(["กิน", "นอน", "เดิน"]);
  });

  it("handles empty input", () => {
    const output = dedupeByBestScore([]);
    expect(output).toEqual([]);
  });

  it("dedupes interleaved duplicates across multiple words", () => {
    const input = [
      makeResult("กิน", 0.8, { created_at: "2024-01-01T00:00:00Z" }),
      makeResult("นอน", 0.7, { created_at: "2024-01-01T01:00:00Z" }),
      makeResult("กิน", 0.9, { created_at: "2024-01-01T02:00:00Z" }),
      makeResult("เดิน", 0.6, { created_at: "2024-01-01T03:00:00Z" }),
      makeResult("นอน", 0.5, { created_at: "2024-01-01T04:00:00Z" }),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(3);
    expect(output.map((r) => r.word)).toEqual(["กิน", "นอน", "เดิน"]);
    expect(output.map((r) => r.total_score)).toEqual([0.9, 0.7, 0.6]);
  });

  it("keeps all first occurrences when every score ties", () => {
    const input = [
      makeResult("กิน", 0.5),
      makeResult("นอน", 0.5),
      makeResult("เดิน", 0.5),
    ];
    const output = dedupeByBestScore(input);
    expect(output).toHaveLength(3);
    expect(output.map((r) => r.word)).toEqual(["กิน", "นอน", "เดิน"]);
  });

  it("returns single-element input unchanged", () => {
    const input = [makeResult("ยิ้ม", 0.8)];
    const output = dedupeByBestScore(input);
    expect(output).toEqual(input);
  });
});
