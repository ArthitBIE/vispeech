import { describe, it, expect, vi } from "vitest";
import {
  estimateMouthOpen,
  createFallbackInstance,
  drawLipMesh,
} from "../index";

describe("estimateMouthOpen", () => {
  const makeLandmarks = (
    overrides: Record<number, { x: number; y: number; z: number }> = {}
  ) => {
    const base: { x: number; y: number; z: number }[] = [];
    // Fill with default landmarks at (0.5, 0.5, 0)
    for (let i = 0; i < 478; i++) {
      base.push({ x: 0.5, y: 0.5, z: 0 });
    }
    // Set face reference points
    base[33] = { x: 0.4, y: 0.3, z: 0 }; // nose bridge
    base[263] = { x: 0.6, y: 0.3, z: 0 }; // right cheek (faceWidth = 0.2)
    // Set mouth corners (mouthWidth = 0.15)
    base[61] = { x: 0.42, y: 0.6, z: 0 }; // left corner
    base[291] = { x: 0.57, y: 0.6, z: 0 }; // right corner
    // Apply overrides
    for (const [idx, val] of Object.entries(overrides)) {
      base[Number(idx)] = val;
    }
    return base;
  };

  it("returns 0 when required landmarks are missing", () => {
    expect(estimateMouthOpen([])).toBe(0);
    const lm = makeLandmarks();
    delete lm[13];
    expect(estimateMouthOpen(lm)).toBe(0);
  });

  it("returns 0 when face width is too small", () => {
    const lm = makeLandmarks({
      33: { x: 0.499, y: 0.3, z: 0 },
      263: { x: 0.5, y: 0.3, z: 0 }, // faceWidth = 0.001
    });
    expect(estimateMouthOpen(lm)).toBe(0);
  });

  it("returns higher score for wider mouth opening", () => {
    // Small opening: verticalGap=0.02
    const small = makeLandmarks({
      13: { x: 0.5, y: 0.59, z: 0 },
      14: { x: 0.5, y: 0.61, z: 0 },
    });
    // Large opening: verticalGap=0.08
    const large = makeLandmarks({
      13: { x: 0.5, y: 0.56, z: 0 },
      14: { x: 0.5, y: 0.64, z: 0 },
    });
    expect(estimateMouthOpen(large)).toBeGreaterThan(estimateMouthOpen(small));
  });

  it("clamps to 100", () => {
    const lm = makeLandmarks({
      13: { x: 0.5, y: 0.4, z: 0 },
      14: { x: 0.5, y: 0.8, z: 0 },
    });
    expect(estimateMouthOpen(lm)).toBeLessThanOrEqual(100);
  });

  it("returns non-negative values", () => {
    const lm = makeLandmarks();
    expect(estimateMouthOpen(lm)).toBeGreaterThanOrEqual(0);
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
