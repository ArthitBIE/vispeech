# src/components/practice/

## Responsibility

Client-side pronunciation practice UI: single-word practice engine (`PracticeWord`), per-word result sidebar (`PracticeResultSidebar`), and static lip-shape reference (`LipExample`). `PracticeWord` is the core: it captures webcam video + audio, runs MediaPipe face-mesh mouth-openness tracking and Thai Web Speech recognition, then POSTs the captured signals to the scoring API and renders the returned score.

## Design

- **PracticeWord as orchestrator component**: owns all hardware lifecycle (camera, mic, audio analyser, recognizer, RAF loop) via `useRef` handles + paired start/stop functions (`handleStartCamera`/`handleStopCamera`, `handleStartListening`/`handleStopListening`, `startAudioLevel`/`stopAudioLevel`), with a single unmount cleanup effect that tears down every resource.
- **MediaPipe integration**: `initFaceMesh(video, canvas)` draws the mesh overlay and reports `mouthOpen` via `onResult` callback; latest value mirrored into `mouthOpenRef` for stale-safe reads inside timers.
- **Audio/visual dual scoring**: visual = mouth-openness % from face-mesh (with demo fallback: random 20–80 value injected after 5 s when no face detected, enabling headless submit); audio = transcript from Web Speech `SpeechRecognizer` + live RMS audio level from `AnalyserNode`. Both travel together in the `/api/score` POST payload.
- **TTS with fallback chain**: `speakThai` (edge TTS) → on error `playFallback` fetches `/api/tts`, plays returned blob, tracks `audioProgress` for the playback meter.
- **Pure presentational siblings**: `LipExample` maps `viseme_group` → `LipShape` via `visemeToLipShape` + `MOUTH_CLASS` Tailwind record (unit-tested in `src/lib/viseme/__tests__/lip-shape.test.ts`); `PracticeResultSidebar` renders `WordResult[]` with local expand/collapse state (overrides the `expanded` flag per item via `Set<number>`).

## Flow

1. `PracticeWord` receives `word: WordRow` + callbacks (`onScored`, `onSkip`, `onLive`) from parent page (`/practice/session`).
2. User clicks เริ่มการฝึกออกเสียง → `handleStartPractice` fires camera + listening in parallel and sets `practicing=true`.
3. `handleStartCamera`: `initFaceMesh` → `onResult` updates `mouthOpen`; 5 s no-face timer arms demo fallback. `handleStartListening`: `getUserMedia` → `startAudioLevel` (RAF RMS loop) + `createSpeechRecognizer("th-TH")` → `onResult` sets `transcript`.
4. Live values stream up via `onLive({ mouthOpen, audioLevel, transcript })` for parent meters.
5. `handleSubmit`: reads Supabase session (`supabase.auth.getSession()`), POSTs `{ wordId, transcript, mouthOpen, sessionId, targetText, visemeGroup }` to `/api/score` with `Authorization: Bearer <token>`, sets `result: ScoreResult` and calls `onScored(score)`.
6. Result UI (score card) offers `handleTryAgain` (resets state, re-plays TTS, stops camera/recognizer) or `onSkip`.
7. `PracticeResultSidebar` (separate flow, dashboard): parent computes `WordResult[]` + `totalAccuracy`; renders accordion list, `onRestart(group)` and `onClose` bubble to parent.

## Integration

- Consumed by:
  - `src/app/practice/session/page.tsx` — imports `PracticeWord` (`WordRow`, `ScoreResult`, `LiveState`), accumulates `ScoreResult` per word; emits `LiveState` to meters.
  - `src/app/(app)/dashboard/page.tsx` — imports `PracticeResultSidebar` (default) + `WordResult` type.
  - `src/lib/viseme/__tests__/lip-shape.test.ts` — imports `visemeToLipShape` from `LipExample`.
- Depends on:
  - `@/lib/mediapipe` — `initFaceMesh`, `FaceMeshInstance` (visual mouth-openness).
  - `@/lib/viseme` — `createSpeechRecognizer`, `SpeechRecognizer` (Thai Web Speech transcript).
  - `@/lib/tts` — `speakThai`, `stopSpeaking` (word audio + unmount cleanup).
  - `@/lib/supabase/client` — browser `supabase` for session token.
  - `src/app/api/score/route.ts` — POST scoring (Bearer token).
  - `src/app/api/tts/route.ts` — fallback audio blob when `speakThai` errors.
  - `@/components/ui/*` — `Button`, `Card`, `CardContent`, `Badge`; `lucide-react` icons.
