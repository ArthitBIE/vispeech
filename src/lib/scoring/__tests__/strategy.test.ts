import { describe, it, expect } from "vitest";
import { DeterministicHeuristicStrategy } from "../index";

const strategy = new DeterministicHeuristicStrategy();

function score(audioScore: number, visualScore: number) {
  return Math.round(visualScore * 0.4 + audioScore * 0.6);
}

describe("DeterministicHeuristicStrategy", () => {
  describe("computeAudioScore (via score().audioScore)", () => {
    it("empty transcript returns 45", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "", mouthOpen: 50 });
      expect(result.audioScore).toBe(45);
    });

    it("fallback 'demo-transcript' returns 45", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "demo-transcript", mouthOpen: 50 });
      expect(result.audioScore).toBe(45);
    });

    it("exact match returns 95", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 50 });
      expect(result.audioScore).toBe(95);
    });

    it("case-insensitive exact match returns 95", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 50 });
      expect(result.audioScore).toBe(95);
    });

    it("target contained in transcript returns 75", () => {
      const result = strategy.score({ wordId: "1", targetWord: "รัก", transcript: "ฉันรักเธอ", mouthOpen: 50 });
      expect(result.audioScore).toBe(75);
    });

    it("partial character overlap returns scaled value", () => {
      // "รัก" and "ราม" share "ร" — 1/3 overlap
      const result = strategy.score({ wordId: "1", targetWord: "รัก", transcript: "ราม", mouthOpen: 50 });
      expect(result.audioScore).toBeGreaterThan(0);
      expect(result.audioScore).toBeLessThanOrEqual(70);
    });

    it("no overlap returns 0", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "dog", mouthOpen: 50 });
      expect(result.audioScore).toBe(0);
    });
  });

  describe("computeVisualScore (via score().visualScore)", () => {
    it("mouthOpen ≤ 0 returns 40", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 0 });
      expect(result.visualScore).toBe(40);
    });

    it("near ideal (diff ≤ 10) returns 90", () => {
      // Closed word (แม่ → ideal 30), mouthOpen 35 → diff 5 ≤ 10
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 35 });
      expect(result.visualScore).toBe(90);
    });

    it("within 25 of ideal returns 75", () => {
      // Closed word (แม่ → ideal 30), mouthOpen 50 → diff 20 ≤ 25
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 50 });
      expect(result.visualScore).toBe(75);
    });

    it("within 40 of ideal returns 55", () => {
      // Closed word (แม่ → ideal 30), mouthOpen 65 → diff 35 ≤ 40
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 65 });
      expect(result.visualScore).toBe(55);
    });
  });

  describe("totalScore composition", () => {
    it("total = 40% visual + 60% audio weighted", () => {
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 35 });
      expect(result.totalScore).toBe(score(result.audioScore, result.visualScore));
    });
  });

  describe("generateHint (via score().feedbackThai)", () => {
    it("total ≥ 90 gives top-tier praise", () => {
      // exact match + ideal visual → both 90+, total ≥ 90
      const result = strategy.score({ wordId: "1", targetWord: "แม่", transcript: "แม่", mouthOpen: 30 });
      expect(result.totalScore).toBeGreaterThanOrEqual(90);
      expect(result.feedbackThai).toContain("ยอดเยี่ยม");
    });
  });
});
