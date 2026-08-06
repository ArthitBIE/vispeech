import { describe, it, expect } from "vitest";
import { DeterministicHeuristicStrategy } from "../index";
import { SCORING_WEIGHTS } from "@/lib/constants";

const strategy = new DeterministicHeuristicStrategy();

function score(audioScore: number, visualScore: number) {
  return Math.round(
    visualScore * SCORING_WEIGHTS.VISUAL + audioScore * SCORING_WEIGHTS.AUDIO
  );
}

// แม่ belongs to ริมฝีปากปิด → ideal mouthOpen 30
const CLOSED = { visemeGroup: "ริมฝีปากปิด" };
// รัก belongs to ปากเปิดกว้าง → ideal mouthOpen 70
const WIDE = { visemeGroup: "ปากเปิดกว้าง" };

describe("DeterministicHeuristicStrategy", () => {
  describe("computeAudioScore (via score().audioScore)", () => {
    it("empty transcript returns 45", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "",
        mouthOpen: 50,
        ...CLOSED,
      });
      expect(result.audioScore).toBe(45);
    });

    it("fallback 'demo-transcript' returns 45", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "demo-transcript",
        mouthOpen: 50,
        ...CLOSED,
      });
      expect(result.audioScore).toBe(45);
    });

    it("exact match returns 95", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 50,
        ...CLOSED,
      });
      expect(result.audioScore).toBe(95);
    });

    it("target contained in transcript returns 75", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "รัก",
        transcript: "ฉันรักเธอ",
        mouthOpen: 50,
        ...WIDE,
      });
      expect(result.audioScore).toBe(75);
    });

    it("partial character overlap returns scaled value", () => {
      // "รัก" and "ราม" share "ร" — 1/3 overlap
      const result = strategy.score({
        wordId: "1",
        targetWord: "รัก",
        transcript: "ราม",
        mouthOpen: 50,
        ...WIDE,
      });
      expect(result.audioScore).toBeGreaterThan(0);
      expect(result.audioScore).toBeLessThanOrEqual(70);
    });

    it("no overlap returns 0", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "dog",
        mouthOpen: 50,
        ...CLOSED,
      });
      expect(result.audioScore).toBe(0);
    });

    it("returns ~65 for Thai prefix match", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "รักสด",
        transcript: "รัก",
        mouthOpen: 50,
      });
      // Prefix match with 2/4 chars → ~65 * (2/4) = ~32
      expect(result.audioScore).toBeGreaterThan(0);
      expect(result.audioScore).toBeLessThan(75);
    });

    it("applies confidence multiplier to audio score", () => {
      const high = strategy.score({
        wordId: "1",
        targetWord: "สวัสดี",
        transcript: "สวัส", // prefix match
        mouthOpen: 50,
        confidence: 1.0,
      });
      const low = strategy.score({
        wordId: "1",
        targetWord: "สวัสดี",
        transcript: "สวัส", // same prefix match
        mouthOpen: 50,
        confidence: 0.3,
      });
      expect(high.audioScore).toBeGreaterThan(low.audioScore);
    });
  });

  describe("computeVisualScore (via score().visualScore)", () => {
    it("mouthOpen ≤ 0 returns 40", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 0,
        ...CLOSED,
      });
      expect(result.visualScore).toBe(40);
    });

    it("near ideal (diff ≤ 10) returns 90", () => {
      // Closed group (ideal 30), mouthOpen 35 → diff 5 ≤ 10
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 35,
        ...CLOSED,
      });
      expect(result.visualScore).toBe(90);
    });

    it("within 25 of ideal returns 75", () => {
      // Closed group (ideal 30), mouthOpen 50 → diff 20 ≤ 25
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 50,
        ...CLOSED,
      });
      expect(result.visualScore).toBe(75);
    });

    it("within 40 of ideal returns 55", () => {
      // Closed group (ideal 30), mouthOpen 65 → diff 35 ≤ 40
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 65,
        ...CLOSED,
      });
      expect(result.visualScore).toBe(55);
    });

    it("wide group uses ideal 70", () => {
      // WIDE ideal 70, mouthOpen 75 → diff 5 → 90
      const result = strategy.score({
        wordId: "1",
        targetWord: "รัก",
        transcript: "รัก",
        mouthOpen: 75,
        ...WIDE,
      });
      expect(result.visualScore).toBe(90);
    });

    it("unknown group falls back to default ideal 55", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "คำ",
        transcript: "คำ",
        mouthOpen: 55,
        visemeGroup: undefined,
      });
      expect(result.visualScore).toBe(90);
    });
  });

  describe("totalScore composition", () => {
    it("total = VISUAL% visual + AUDIO% audio weighted", () => {
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 35,
        ...CLOSED,
      });
      expect(result.totalScore).toBe(
        score(result.audioScore, result.visualScore)
      );
    });
  });

  describe("generateHint (via score().feedbackThai)", () => {
    it("total ≥ 90 gives top-tier praise", () => {
      // exact match + ideal visual → both 90+, total ≥ 90
      const result = strategy.score({
        wordId: "1",
        targetWord: "แม่",
        transcript: "แม่",
        mouthOpen: 30,
        ...CLOSED,
      });
      expect(result.totalScore).toBeGreaterThanOrEqual(90);
      expect(result.feedbackThai).toContain("ยอดเยี่ยม");
    });
  });
});
