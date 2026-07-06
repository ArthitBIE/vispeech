export interface FaceMeshResult {
  landmarks: { x: number; y: number; z: number }[][] | null
  mouthOpen: number
  hasFace: boolean
}

export interface FaceMeshInstance {
  start: () => Promise<void>
  stop: () => void
  isActive: () => boolean
  onResult: (callback: (result: FaceMeshResult) => void) => void
}

export async function initFaceMesh(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement,
): Promise<FaceMeshInstance> {
  try {
    const { FaceMesh } = await import("@mediapipe/face_mesh");
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
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        resultCallbacks.forEach((cb) =>
          cb({ landmarks: null, mouthOpen: 0, hasFace: false }),
        );
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const mouthOpen = estimateMouthOpen(landmarks);

      resultCallbacks.forEach((cb) =>
        cb({ landmarks: [landmarks], mouthOpen, hasFace: true }),
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

function estimateMouthOpen(landmarks: { x: number; y: number; z: number }[]): number {
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  if (!upperLip || !lowerLip) return 0;

  const dy = Math.abs(lowerLip.y - upperLip.y);
  const lipHeight = landmarks[13] && landmarks[14]
    ? Math.hypot(lowerLip.x - upperLip.x, lowerLip.y - upperLip.y)
    : 0;

  return Math.min(100, Math.round(lipHeight * 500));
}

function createFallbackInstance(): FaceMeshInstance {
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
          }),
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
