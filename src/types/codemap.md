# src/types/

## Responsibility

Holds ambient TypeScript declarations for browser APIs and third-party libraries that ship no usable types: the Web Speech API (`SpeechRecognition`) and MediaPipe's legacy `@mediapipe/*` packages. Type-only module — no runtime code, compiled away by `tsc`; exists solely to make the rest of the app type-check.

## Design

- **Global interface augmentation** (`global.d.ts`): declares `SpeechRecognition`, `SpeechRecognitionEvent`, `SpeechRecognitionResultList`, `SpeechRecognitionResult`, `SpeechRecognitionAlternative`, `SpeechRecognitionErrorEvent` as global interfaces, then augments the `Window` interface with `SpeechRecognition` and `webkitSpeechRecognition` constructors. Mirrors the real DOM/Chrome API shape so `new SpeechRecognition()` and event callbacks type-check without `any`.
- **Module declaration shims** (`mediapipe.d.ts`): `declare module "@mediapipe/face_mesh"` / `"@mediapipe/camera_utils"` / `"@mediapipe/drawing_utils"` provide structural types (`FaceMesh`, `Camera`, `drawConnectors`, `drawLandmarks`, `LandmarkConnectionArray`) for packages that lack bundled typings. Faces are loosely typed (`Record<string, any>`, `any[]`) because MediaPipe landmark data is schema-free at this level.

## Flow

- No runtime data flows through this module — declarations are erased at compile time.
- `global.d.ts`: `src/lib/viseme/index.ts` reads `window.SpeechRecognition || window.webkitSpeechRecognition` (typed via the `Window` augmentation), constructs a recognition instance, and receives `onresult`/`onerror` events typed by these interfaces. Tests (`src/lib/viseme/__tests__/speech.test.ts`) stub `window.SpeechRecognition` against the same shape.
- `mediapipe.d.ts`: `src/lib/mediapipe/index.ts` dynamically imports `FaceMesh` + `FACEMESH_LIPS` and `Camera`, and statically imports `LandmarkConnectionArray`; results flow from `FaceMesh.send()` → `onResults()` callback → `drawLipMesh()` for canvas rendering.

## Integration

- Consumed by: `src/lib/viseme/index.ts` (SpeechRecognition types), `src/lib/mediapipe/index.ts` (MediaPipe module types), plus the viseme unit tests that stub these globals.
- Depends on: nothing at runtime; compile-time only on the DOM lib (`Event`, `EventTarget`, `Window`, `HTMLVideoElement`, `CanvasRenderingContext2D`) provided by TS `lib.dom.d.ts`.
