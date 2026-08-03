import type { LandmarkConnectionArray } from "@mediapipe/drawing_utils";

// ponytail: vendored from @mediapipe/drawing_utils — the package ships a
// Closure-compiled global-attaching script with no ESM exports, which breaks
// Turbopack bundling ("module has no exports at all"). Replace with real
// package import if it ever ships proper exports.
export function drawConnectors(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  connections: LandmarkConnectionArray,
  config: { color?: string; lineWidth?: number } = {}
) {
  const color = config.color ?? "white";
  const lineWidth = config.lineWidth ?? 4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  for (const [from, to] of connections) {
    const a = landmarks[from];
    const b = landmarks[to];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
    ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number }[],
  config: { color?: string; radius?: number } = {}
) {
  const color = config.color ?? "white";
  const radius = config.radius ?? 6;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  for (const l of landmarks) {
    ctx.beginPath();
    ctx.arc(
      l.x * ctx.canvas.width,
      l.y * ctx.canvas.height,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
  ctx.restore();
}

export interface FaceMeshResult {
  landmarks: { x: number; y: number; z: number }[][] | null;
  mouthOpen: number;
  hasFace: boolean;
}

export interface FaceMeshInstance {
  start: () => Promise<void>;
  stop: () => void;
  isActive: () => boolean;
  onResult: (callback: (result: FaceMeshResult) => void) => void;
}

export function drawLipMesh(
  canvasElement: HTMLCanvasElement,
  landmarks: { x: number; y: number; z: number }[],
  connections: LandmarkConnectionArray
) {
  const ctx = canvasElement.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawConnectors(ctx, landmarks, connections, {
    color: "#00FF00",
    lineWidth: 1,
  });
  drawLandmarks(ctx, landmarks, { color: "#00FF00", radius: 1 });
}

export async function initFaceMesh(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): Promise<FaceMeshInstance> {
  try {
    const { FaceMesh, FACEMESH_LIPS } = await import("@mediapipe/face_mesh");
    const { Camera } = await import("@mediapipe/camera_utils");

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const resultCallbacks: ((result: FaceMeshResult) => void)[] = [];
    let active = false;

    faceMesh.onResults((results) => {
      if (
        canvasElement.width !== videoElement.videoWidth ||
        canvasElement.height !== videoElement.videoHeight
      ) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
      }

      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        const ctx = canvasElement.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        resultCallbacks.forEach((cb) =>
          cb({ landmarks: null, mouthOpen: 0, hasFace: false })
        );
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const mouthOpen = estimateMouthOpen(landmarks);
      drawLipMesh(canvasElement, landmarks, FACEMESH_LIPS);

      resultCallbacks.forEach((cb) =>
        cb({ landmarks: [landmarks], mouthOpen, hasFace: true })
      );
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    return {
      start: async () => {
        await camera.start();
        active = true;
      },
      stop: () => {
        camera.stop();
        active = false;
      },
      isActive: () => active,
      onResult: (cb) => {
        resultCallbacks.push(cb);
      },
    };
  } catch (e) {
    console.warn("MediaPipe failed to load, using demo mode:", e);
    return createFallbackInstance();
  }
}

export function estimateMouthOpen(
  landmarks: { x: number; y: number; z: number }[]
): number {
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  if (!upperLip || !lowerLip) return 0;

  const dy = Math.abs(lowerLip.y - upperLip.y);
  const lipHeight =
    landmarks[13] && landmarks[14]
      ? Math.hypot(lowerLip.x - upperLip.x, lowerLip.y - upperLip.y)
      : 0;

  return Math.min(100, Math.round(lipHeight * 500));
}

export function createFallbackInstance(): FaceMeshInstance {
  const resultCallbacks: ((result: FaceMeshResult) => void)[] = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;

  return {
    start: async () => {
      console.log("MediaPipe not available — running in demo mode");
      await new Promise((r) => setTimeout(r, 500));
      intervalId = setInterval(() => {
        resultCallbacks.forEach((cb) =>
          cb({
            landmarks: null,
            mouthOpen: Math.floor(Math.random() * 60) + 20,
            hasFace: true,
          })
        );
      }, 500);
    },
    stop: () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    },
    isActive: () => intervalId !== null,
    onResult: (cb) => {
      resultCallbacks.push(cb);
    },
  };
}
