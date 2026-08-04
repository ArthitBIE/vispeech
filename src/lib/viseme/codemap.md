# src/lib/viseme/

## Responsibility

Thai speech-to-text recognition wrapper: exposes a browser `SpeechRecognizer` abstraction (Web Speech API) for the Thai pronunciation practice flow. Despite the folder name, it does **not** contain viseme/mouth-shape mapping — that lives in `src/components/practice/LipExample.tsx` (`visemeToLipShape`), which the tests in `__tests__/lip-shape.test.ts` import directly.

## Design

- **Adapter/factory**: `createSpeechRecognizer(lang = "th-TH")` wraps `window.SpeechRecognition`/`webkitSpeechRecognition` behind a uniform `SpeechRecognizer` interface (`start`/`stop`/`isAvailable`/`onResult`/`onError`).
- **Fallback strategy**: `createFallbackRecognizer()` — a demo-mode stub returning `"demo-transcript"` when the Web Speech API is missing or hits recoverable errors (`network`, `not-allowed`, `no-speech`-class codes). `isAvailable()` reports real-vs-demo mode.
- **Multi-callback pub/sub**: `onResult`/`onError` fan out to registered callbacks; callbacks are re-registered onto the fallback instance on switch.
- **Localized error mapping**: `errorMessages` record maps browser error codes to Thai user-facing strings.
- **State flags**: `running`/`stopping`/`inFallback` guard double-starts, auto-restarts, and fallback switching.

## Flow

1. `PracticeWord` calls `createSpeechRecognizer("th-TH")` → if `SpeechRecognition` missing, immediately returns fallback.
2. `start()` resets `finalTranscript`, sets `running = true`, calls `recognition.start()` (idempotent; no-op if already running).
3. `onresult` appends final segments to `finalTranscript`, concatenates interim; emits `SpeechResult {transcript, confidence, isFinal}` to all registered callbacks (transcript = interim if present, else accumulated final).
4. `onerror`: recoverable codes → `switchToFallback()` (stops real recognizer, creates fallback, re-registers callbacks, starts it); others → Thai error string to error callbacks.
5. `onend` auto-restarts `recognition.start()` unless `stopping`/`inFallback`/not running (Chrome fires `onend` spuriously despite `continuous = true`).
6. `stop()` sets `stopping = true`, stops recognizer, resolves with `finalTranscript` (fallback: resolves `"demo-transcript"` after 1500ms).

## Integration

- Consumed by: `src/components/practice/PracticeWord.tsx` (imports `createSpeechRecognizer` + type `SpeechRecognizer`; feeds transcript into scoring alongside MediaPipe mouth-openness and audio level).
- Depends on: browser `window.SpeechRecognition`/`webkitSpeechRecognition` (Web Speech API); nothing else in the repo — no imports from other `src/lib` modules. Tests use Vitest + `vi.stubGlobal`.
