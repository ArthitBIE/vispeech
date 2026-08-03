import { describe, it, expect, vi } from "vitest";
import {
  estimateMouthOpen,
  createFallbackInstance,
  drawLipMesh,
} from "../index";

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

describe("drawLipMesh", () => {
  function makeFakeCtx() {
    return {
      canvas: { width: 640, height: 480 },
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    };
  }

  it("draws lip mesh: clearRect + stroke (drawConnectors) + arc (drawLandmarks)", () => {
    const ctx = makeFakeCtx();
    const canvas = {
      getContext: vi.fn(() => ctx),
      width: 640,
      height: 480,
    };
    const landmarks = [
      { x: 0.3, y: 0.4, z: 0 },
      { x: 0.35, y: 0.4, z: 0 },
      { x: 0.4, y: 0.4, z: 0 },
    ];
    const connections = [
      [0, 1],
      [1, 2],
    ];

    drawLipMesh(
      canvas as unknown as HTMLCanvasElement,
      landmarks,
      connections as any
    );

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  });

  it("no-ops when getContext returns null", () => {
    const canvas = {
      getContext: vi.fn(() => null),
      width: 640,
      height: 480,
    };
    const landmarks = [{ x: 0.3, y: 0.4, z: 0 }];
    const connections = [[0, 0]];

    expect(() =>
      drawLipMesh(
        canvas as unknown as HTMLCanvasElement,
        landmarks,
        connections as any
      )
    ).not.toThrow();
  });
});
