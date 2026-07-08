import { describe, it, expect, vi } from "vitest";
import { createFallbackRecognizer, createSpeechRecognizer } from "../index";

describe("createFallbackRecognizer", () => {
  it("start() resolves without error", async () => {
    const recognizer = createFallbackRecognizer();
    await expect(recognizer.start()).resolves.toBeUndefined();
  }, 10000);

  it("stop() returns a transcript string", async () => {
    const recognizer = createFallbackRecognizer();
    await recognizer.start();
    const result = await recognizer.stop();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  }, 10000);

  it("isAvailable() returns false", () => {
    const recognizer = createFallbackRecognizer();
    expect(recognizer.isAvailable()).toBe(false);
  });

  it("onError callback fires with error message", async () => {
    const recognizer = createFallbackRecognizer();
    const callback = vi.fn();
    recognizer.onError(callback);
    // onError uses setTimeout(100ms) internally
    await new Promise((r) => setTimeout(r, 200));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(expect.any(String));
  });

  it("multiple onError callbacks all fire", async () => {
    const recognizer = createFallbackRecognizer();
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    recognizer.onError(cb1);
    recognizer.onError(cb2);
    await new Promise((r) => setTimeout(r, 200));
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
  });
});

describe("createSpeechRecognizer", () => {
  it("returns a SpeechRecognizer object", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    expect(recognizer).toBeDefined();
    expect(typeof recognizer.start).toBe("function");
    expect(typeof recognizer.stop).toBe("function");
    expect(typeof recognizer.isAvailable).toBe("function");
    expect(typeof recognizer.onResult).toBe("function");
    expect(typeof recognizer.onError).toBe("function");
  });
});
