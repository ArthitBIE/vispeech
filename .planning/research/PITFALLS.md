# Pitfalls Research: vispeech

## 1. Web Speech API Thai Support

**Warning sign**: `SpeechRecognition` not available in Firefox/Safari; th-TH language model may be unavailable even in Chrome on some platforms.
**Prevention**: Feature-detect at runtime; show graceful fallback message in Thai.
**Phase**: Phase 1 — implement fallback immediately, not as a TODO.

## 2. MediaPipe WASM Loading

**Warning sign**: Slow initial load, browser compatibility issues.
**Prevention**: Show loading spinner; implement 5-second timeout fallback to demo mode.
**Phase**: Phase 1 — build fallback into the abstraction layer from day one.

## 3. Supabase Environment Variables Missing

**Warning sign**: App crashes on startup if NEXT_PUBLIC_SUPABASE_URL is undefined.
**Prevention**: Guard all Supabase calls with existence checks; `npm run build` must pass without env vars.
**Phase**: Phase 1 — build verification step must pass without env vars.

## 4. Over-Engineering Scoring

**Warning sign**: Spending time on complex ML-based scoring for the MVP.
**Prevention**: Use simple heuristic (string similarity for audio, random range with trend for visual). Document as "non-clinical demo scores."
**Phase**: Phase 1 — keep it simple.

## 5. Thai Language Text Rendering

**Warning sign**: Issues with Thai character rendering, font support, or text direction in Tailwind.
**Prevention**: Use system Thai fonts; test with sample Thai text early.
**Phase**: Phase 1 — test Thai rendering in Wave 1.
