---
phase: 1
plan: 6
type: lib
wave: 5
depends_on: [1]
files_modified:
  - src/lib/mediapipe/index.ts
  - src/lib/viseme/index.ts
autonomous: true
requirements: [PRAC-03, PRAC-04]
---

<objective>
Create clean abstraction layers for MediaPipe Face Mesh and Web Speech API with graceful fallback modes. These abstractions are consumed by the practice page (Wave 5).
</objective>

<tasks>
<task>
<type>create</type>
<action>Create MediaPipe Face Mesh abstraction with fallback</action>
<files>src/lib/mediapipe/index.ts</files>
<read_first>none</read_first>
<details>
Create the directory and file at src/lib/mediapipe/index.ts.

This module wraps MediaPipe Face Mesh and provides a clean API:

```typescript
export interface FaceMeshResult {
  landmarks: { x: number; y: number; z: number }[][] | null
  mouthOpen: number // 0-100, how open the mouth is (estimated)
  hasFace: boolean
}

export interface FaceMeshInstance {
  start: (videoElement: HTMLVideoElement) => Promise<void>
  stop: () => void
  isActive: () => boolean
  onResult: (callback: (result: FaceMeshResult) => void) => void
}

export async function initFaceMesh(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): Promise<FaceMeshInstance> {
  // Try to load MediaPipe; catch errors and fall back
  try {
    const { FaceMesh } = await import('@mediapipe/face_mesh')
    const { Camera } = await import('@mediapipe/camera_utils')
    const { drawConnectors } = await import('@mediapipe/drawing_utils')
    const { FACEMESH_TESSELATION } = await import('@mediapipe/face_mesh')
    
    // ... setup FaceMesh with video input
    // ... draw face mesh on canvas
    // ... return real FaceMeshInstance
  } catch (e) {
    console.warn('MediaPipe failed to load, using demo mode:', e)
    return createFallbackInstance(videoElement)
  }
}
```

Fallback implementation (createFallbackInstance):
- Returns a FaceMeshInstance that:
  - start(): logs "MediaPipe not available — running in demo mode"
  - stop(): no-op
  - isActive(): returns true (pretends to work for demo)
  - onResult(): periodically fires callback with simulated mouth-open values (random 20-80 range)
- The practice page uses this seamlessly

Key design decisions:
- The abstraction hides all MediaPipe complexity
- Callers only interact with FaceMeshInstance + FaceMeshResult
- Fallback is seamless — practice page doesn't need to know
- Export type definitions for TypeScript consumers
</details>
<verify>File exports initFaceMesh, FaceMeshInstance, FaceMeshResult types</verify>
<acceptance_criteria>MediaPipe abstraction with typed API and graceful fallback created</acceptance_criteria>
</task>

<task>
<type>create</type>
<action>Create Web Speech API abstraction with fallback</action>
<files>src/lib/viseme/index.ts</files>
<read_first>none</read_first>
<details>
Create the directory and file at src/lib/viseme/index.ts.

This module wraps the Web Speech API for Thai speech recognition:

```typescript
export interface SpeechResult {
  transcript: string
  confidence: number // 0-1
  isFinal: boolean
}

export interface SpeechRecognizer {
  start: () => Promise<void>
  stop: () => Promise<string> // returns final transcript
  isAvailable: () => boolean
  onResult: (callback: (result: SpeechResult) => void) => void
  onError: (callback: (error: string) => void) => void
}

export function createSpeechRecognizer(lang: string = 'th-TH'): SpeechRecognizer {
  // Check if SpeechRecognition is available
  const SpeechRecognition =
    (typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null

  if (!SpeechRecognition) {
    console.warn('Web Speech API not available, using demo mode')
    return createFallbackRecognizer()
  }

  // ... setup real SpeechRecognition with lang
  // ... return real SpeechRecognizer
}

function createFallbackRecognizer(): SpeechRecognizer {
  // Demo mode: simulate recognition
  // start(): shows Thai message about browser not supporting
  // stop(): returns a simulated transcript for demo purposes
  // isAvailable(): returns false
  // onError(): fires with Thai error message on first call
  return {
    start: async () => {},
    stop: async () => {
      await new Promise(r => setTimeout(r, 1500))
      return 'demo-transcript'
    },
    isAvailable: () => false,
    onResult: () => {},
    onError: (cb) => {
      setTimeout(() => cb('เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด'), 100)
    },
  }
}
```

The practice page (Wave 5) uses createSpeechRecognizer('th-TH') and doesn't need to know whether real speech recognition or fallback is active.
</details>
<verify>File exports createSpeechRecognizer, SpeechRecognizer, SpeechResult types</verify>
<acceptance_criteria>Web Speech API abstraction with Thai support and graceful fallback created</acceptance_criteria>
</task>
</tasks>

<verification>
- MediaPipe module exports proper TypeScript types
- MediaPipe module has seamless fallback
- Viseme module exports proper TypeScript types
- Viseme module has graceful fallback with Thai message
- Both modules can be imported without errors
- Fallback implementations don't crash
</verification>

<success_criteria>
- src/lib/mediapipe/index.ts with FaceMesh abstraction + demo fallback
- src/lib/viseme/index.ts with SpeechRecognition abstraction + demo fallback
- Clean TypeScript APIs for consumption by practice page
- Graceful handling when browser APIs unavailable
</success_criteria>
