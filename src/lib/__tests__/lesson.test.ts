import { describe, it, expect } from "vitest";
import { deriveLesson, LESSONS } from "@/lib/lesson";

describe("deriveLesson", () => {
  it("returns the lesson when all its words are present", () => {
    // "easy" lesson words
    const words = ["ยา", "ฝา", "ดี", "มี", "ดู"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe("easy");
  });

  it("returns the lesson with highest overlap when mixed", () => {
    // 3 easy words + 2 vowels words
    const words = ["ยา", "ฝา", "ดี", "อะ", "อา"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe("easy");
  });

  it("returns undefined when no words match any lesson", () => {
    const words = ["ยิ้ม", "สวัสดี", "unknown"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeUndefined();
  });

  it("returns undefined for empty array", () => {
    const lesson = deriveLesson([]);
    expect(lesson).toBeUndefined();
  });

  it("returns correct lesson for conversation words", () => {
    const words = ["สวัสดีครับ", "ขอบคุณค่ะ"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe("conversation");
  });

  it("tie-breaks by LESSONS order when overlap counts equal", () => {
    // Both easy and vowels have 1 match each
    const words = ["ยา", "อะ"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe("easy"); // easy comes first in LESSONS
  });

  it("handles partial overlap with a single lesson", () => {
    // Only 2 of 5 easy words present
    const words = ["ยา", "ฝา"];
    const lesson = deriveLesson(words);
    expect(lesson).toBeDefined();
    expect(lesson?.id).toBe("easy");
  });
});
