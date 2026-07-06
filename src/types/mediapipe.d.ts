declare module "@mediapipe/face_mesh" {
  export class FaceMesh {
    constructor(config: { locateFile: (file: string) => string });
    setOptions(options: Record<string, any>): void;
    onResults(callback: (results: any) => void): void;
    send(inputs: { image: HTMLVideoElement }): Promise<void>;
    close(): void;
  }
  export const FACEMESH_TESSELATION: any[];
}

declare module "@mediapipe/camera_utils" {
  export class Camera {
    constructor(
      videoElement: HTMLVideoElement,
      config: { onFrame: () => Promise<void>; width?: number; height?: number },
    );
    start(): Promise<void>;
    stop(): void;
  }
}

declare module "@mediapipe/drawing_utils" {
  export function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any[],
    config?: any,
  ): void;
}
