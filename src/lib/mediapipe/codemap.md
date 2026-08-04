# src/lib/mediapipe/

## Responsibility

Client-side wrapper around the legacy MediaPipe FaceMesh solution for real-time mouth openness detection. Owns the full camera → landmark inference → lip-mesh overlay → mouth-open score pipeline, exposing a minimal `FaceMeshInstance` API so consumers stay decoupled from MediaPipe internals.

## Design

- **Lazy dynamic imports**: `FaceMesh` and `Camera` loaded via `import()` at `initFaceMesh()` call time — keeps MediaPipe (~several MB WASM) out of the main bundle; failure is caught and degraded.
- **CDN model hosting**: `locateFile` points at `cdn.jsdelivr.net` for `.wasm`/`.bin` assets instead of bundling them.
- **Push-based callback registration**: `onResult(cb)` accumulates subscribers; results are fanned out to all callbacks — no pull/getters.
- **Facade instance**: `initFaceMesh` returns a `FaceMeshInstance` interface (`start`/`stop`/`isActive`/`onResult`), hiding MediaPipe's imperative API and lifecycle.
- **Mouth Aspect Ratio heuristic**: `estimateMouthOpen` computes Euclidean distance between landmarks 13 (upper lip) and 14 (lower lip), scales by 500, clamps to [0, 100].
- **Graceful degradation / demo mode**: any load/init failure falls back to `createFallbackInstance`, which emits random `mouthOpen` (20–80) on a 500ms interval so the practice flow still works without a camera/models.
- **Vendored drawing utils**: `drawConnectors`/`drawLandmarks` copied from `@mediapipe/drawing_utils` (Closure-compiled, no ESM exports, breaks Turbopack).

## Flow

1. Consumer (`PracticeWord.tsx`) calls `initFaceMesh(videoElement, canvasElement)`.
2. Dynamic imports resolve → `FaceMesh` configured (`maxNumFaces: 1`, `refineLandmarks: true`), `Camera` attaches to the video element at 640×480.
3. `start()` → `camera.start()`; `onFrame` sends each frame to `faceMesh.send({ image })`.
4. `onResults` fires per frame: canvas resized to video dims; if no face, clears canvas and emits `{ landmarks: null, mouthOpen: 0, hasFace: false }`.
5. With a face: takes `multiFaceLandmarks[0]`, computes `estimateMouthOpen(landmarks)`, draws lip mesh via `drawLipMesh` (green `FACEMESH_LIPS` connectors + landmark dots), emits `{ landmarks: [landmarks], mouthOpen, hasFace: true }` to all subscribers.
6. Emitted `mouthOpen` consumed by subscriber → React state for scoring.
7. `stop()` → `camera.stop()`, flips `active` flag; fallback path instead clears the demo interval.

## Integration

- Consumed by: `src/components/practice/PracticeWord.tsx` — `initFaceMesh` + `onResult` feeds `mouthOpen` into practice scoring; `FaceMeshInstance` type imported directly. (Single consumer.)
- Depends on: `@mediapipe/face_mesh` + `@mediapipe/camera_utils` (dynamic imports), CDN-hosted model/WASM assets, `@mediapipe/drawing_utils` types (`LandmarkConnectionArray`, type-only), browser WebGL/Canvas 2D APIs.
- Tests: `__tests__/index.test.ts` (Vitest) covers `estimateMouthOpen`, `createFallbackInstance` lifecycle, `drawLipMesh` canvas calls.
