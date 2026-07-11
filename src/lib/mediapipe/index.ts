export interface LipMetrics {
  width: number;
  height: number;
  upperLipHeight: number;
  lowerLipHeight: number;
  normWidth: number;
  normHeight: number;
  normUpperHeight: number;
  normLowerHeight: number;
  curvature: number;
  asymmetry: number;
  area: number;
}

export interface FaceMeshResult {
  landmarks: { x: number; y: number; z: number }[][] | null;
  mouthOpen: number;
  lipMetrics?: LipMetrics;
  visemeGroup?: string;
  hasFace: boolean;
}

export interface FaceMeshInstance {
  start: () => Promise<void>;
  stop: () => void;
  isActive: () => boolean;
  onResult: (callback: (result: FaceMeshResult) => void) => void;
}

const LIP_INDICES = {
  upperOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
  lowerOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
  upperInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  lowerInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
  corners: { left: 61, right: 291 },
  centers: { upper: 13, lower: 14 },
  customConnections: [
    [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
    [291, 375], [375, 321], [321, 405], [405, 314], [314, 17], [17, 84], [84, 181], [181, 91], [91, 146], [146, 61],
    [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308],
    [308, 324], [324, 318], [318, 402], [402, 317], [317, 14], [14, 87], [87, 178], [178, 88], [88, 95], [95, 78],
  ],
} as const;

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function polygonArea(points: { x: number; y: number }[]): number {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    area += points[j].x * points[i].y - points[i].x * points[j].y;
  }
  return Math.abs(area) / 2;
}

function calculateFaceWidth(landmarks: { x: number; y: number; z: number }[]): number {
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  if (!leftCheek || !rightCheek) return 1;
  return dist(leftCheek, rightCheek);
}

function calculateLipMetrics(landmarks: { x: number; y: number; z: number }[]): LipMetrics {
  const { corners, centers, upperInner, lowerInner } = LIP_INDICES;

  const leftCorner = landmarks[corners.left];
  const rightCorner = landmarks[corners.right];
  const upperCenter = landmarks[centers.upper];
  const lowerCenter = landmarks[centers.lower];

  if (!leftCorner || !rightCorner || !upperCenter || !lowerCenter) {
    return {
      width: 0, height: 0, upperLipHeight: 0, lowerLipHeight: 0,
      normWidth: 0, normHeight: 0, normUpperHeight: 0, normLowerHeight: 0,
      curvature: 0, asymmetry: 0, area: 0,
    };
  }

  const width = dist(leftCorner, rightCorner);
  const height = dist(upperCenter, lowerCenter);

  const upperInnerPoints = upperInner.map((i) => landmarks[i]).filter(Boolean) as { x: number; y: number }[];
  const lowerInnerPoints = lowerInner.map((i) => landmarks[i]).filter(Boolean) as { x: number; y: number }[];

  const upperLipHeight = upperInnerPoints.length > 0
    ? Math.max(...upperInnerPoints.map((p) => Math.abs(p.y - upperCenter.y)))
    : 0;
  const lowerLipHeight = lowerInnerPoints.length > 0
    ? Math.max(...lowerInnerPoints.map((p) => Math.abs(p.y - lowerCenter.y)))
    : 0;

  const faceWidth = calculateFaceWidth(landmarks);
  const normWidth = faceWidth > 0 ? width / faceWidth : 0;
  const normHeight = faceWidth > 0 ? height / faceWidth : 0;
  const normUpperHeight = faceWidth > 0 ? upperLipHeight / faceWidth : 0;
  const normLowerHeight = faceWidth > 0 ? lowerLipHeight / faceWidth : 0;

  const curvature = normWidth > 0 ? normHeight / normWidth : 0;

  const leftUpper = landmarks[upperInner[5]];
  const rightUpper = landmarks[upperInner[upperInner.length - 2]];
  const leftLower = landmarks[lowerInner[5]];
  const rightLower = landmarks[lowerInner[lowerInner.length - 2]];

  const leftHeight = leftUpper && leftLower ? dist(leftUpper, leftLower) : 0;
  const rightHeight = rightUpper && rightLower ? dist(rightUpper, rightLower) : 0;
  const avgHeight = (leftHeight + rightHeight) / 2;
  const asymmetry = avgHeight > 0 ? Math.abs(leftHeight - rightHeight) / avgHeight : 0;

  const allLipPoints = [...upperInnerPoints, ...lowerInnerPoints.reverse()];
  const area = allLipPoints.length >= 3 ? polygonArea(allLipPoints) / (faceWidth * faceWidth) : 0;

  return {
    width,
    height,
    upperLipHeight,
    lowerLipHeight,
    normWidth,
    normHeight,
    normUpperHeight,
    normLowerHeight,
    curvature,
    asymmetry,
    area,
  };
}

function classifyViseme(_landmarks: { x: number; y: number; z: number }[], lipMetrics: LipMetrics): string {
  const { normWidth, normHeight, curvature } = lipMetrics;

  if (normHeight > 0.15 && normWidth > 0.35) return "อ";
  if (normHeight >= 0.08 && normHeight <= 0.15 && normWidth >= 0.25 && normWidth <= 0.35) return "อะ";
  if (normHeight > 0.12 && normWidth > 0.38) return "อา";
  if (normWidth > 0.40 && normHeight < 0.10) return "อิ/อี";
  if (normWidth < 0.25 && normHeight < 0.08) return "อุ/อู";
  if (normWidth >= 0.30 && normWidth <= 0.40 && normHeight >= 0.08 && normHeight <= 0.12) return "เอ/แอ";
  if (normWidth >= 0.25 && normWidth <= 0.35 && normHeight >= 0.08 && normHeight <= 0.12 && curvature > 0.5) return "โอ/ออ";

  return "อะ";
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
      const lipMetrics = calculateLipMetrics(landmarks);
      const visemeGroup = classifyViseme(landmarks, lipMetrics);

      resultCallbacks.forEach((cb) =>
        cb({ landmarks: [landmarks], mouthOpen, lipMetrics, visemeGroup, hasFace: true }),
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

export const VISEME_GROUPS = ["อ", "อะ", "อา", "อิ/อี", "อุ/อู", "เอ/แอ", "โอ/ออ"] as const;

export function createMockLipMetrics(): LipMetrics {
  return {
    width: 0.3,
    height: 0.1,
    upperLipHeight: 0.05,
    lowerLipHeight: 0.05,
    normWidth: 0.3,
    normHeight: 0.1,
    normUpperHeight: 0.05,
    normLowerHeight: 0.05,
    curvature: 0.33,
    asymmetry: 0.05,
    area: 0.01,
  };
}

function createFallbackInstance(): FaceMeshInstance {
  const resultCallbacks: ((result: FaceMeshResult) => void)[] = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const mockLipMetrics = createMockLipMetrics();

  return {
    start: async () => {
      console.log("MediaPipe not available — running in demo mode");
      await new Promise((r) => setTimeout(r, 500));
      intervalId = setInterval(() => {
        const mouthOpen = Math.floor(Math.random() * 60) + 20;
        const visemeGroup = VISEME_GROUPS[Math.floor(Math.random() * VISEME_GROUPS.length)];
        resultCallbacks.forEach((cb) =>
          cb({
            landmarks: null,
            mouthOpen,
            lipMetrics: mockLipMetrics,
            visemeGroup,
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