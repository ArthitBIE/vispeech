import { describe, it, expect, vi } from "vitest";
import { estimateMouthOpen, createFallbackInstance } from "../index";

function makeLandmark(x: number, y: number, z: number) {
  return { x, y, z };
}

describe("estimateMouthOpen", () => {
  it("returns 0 when landmarks[13] missing", () => {
    const landmarks = Array(13).fill(makeLandmark(0, 0, 0));
    expect(estimateMouthOpen(landmarks)).toBe(0);
  });

  it("returns 0 when landmarks[14] missing", () => {
    const landmarks = Array(14).fill(makeLandmark(0, 0, 0));
    expect(estimateMouthOpen(landmarks)).toBe(0);
  });

  it("returns scaled distance for normal difference", () => {
    const landmarks = Array(15).fill(makeLandmark(0, 0, 0));
    landmarks[13] = makeLandmark(0, 0, 0); // upper lip
    landmarks[14] = makeLandmark(0, 0.1, 0); // lower lip, dy = 0.1
    // hypot(0, 0.1) = 0.1, * 500 = 50
    expect(estimateMouthOpen(landmarks)).toBe(50);
  });

  it("caps at 100 for large mouth opening", () => {
    const landmarks = Array(15).fill(makeLandmark(0, 0, 0));
    landmarks[13] = makeLandmark(0, 0, 0);
    landmarks[14] = makeLandmark(0, 0.25, 0); // hypot(0, 0.25) = 0.25, * 500 = 125 → min(100, 125) = 100
    expect(estimateMouthOpen(landmarks)).toBe(100);
  });
});

describe("createFallbackInstance", () => {
  it("start() resolves without error", async () => {
    const instance = createFallbackInstance();
    await expect(instance.start()).resolves.toBeUndefined();
    instance.stop();
  });

  it("isActive reflects start/stop state", async () => {
    const instance = createFallbackInstance();
    expect(instance.isActive()).toBe(false);
    await instance.start();
    expect(instance.isActive()).toBe(true);
    instance.stop();
    expect(instance.isActive()).toBe(false);
  });

  it("onResult fires callbacks after start", async () => {
    const instance = createFallbackInstance();
    const callback = vi.fn();
    instance.onResult(callback);
    await instance.start();
    await new Promise((r) => setTimeout(r, 600)); // interval fires every 500ms
    expect(callback).toHaveBeenCalled();
    const result = callback.mock.calls[0][0];
    expect(result).toHaveProperty("mouthOpen");
    expect(result).toHaveProperty("hasFace", true);
    expect(result).toHaveProperty("landmarks", null);
    instance.stop();
  });

  it("mouthOpen values are in 20-80 range", async () => {
    const instance = createFallbackInstance();
    const callback = vi.fn();
    instance.onResult(callback);
    await instance.start();
    await new Promise((r) => setTimeout(r, 1200)); // 2 intervals
    instance.stop();
    expect(callback).toHaveBeenCalled();
    for (const call of callback.mock.calls) {
      const mouthOpen = call[0].mouthOpen;
      expect(mouthOpen).toBeGreaterThanOrEqual(20);
      expect(mouthOpen).toBeLessThanOrEqual(80);
    }
  });
});
