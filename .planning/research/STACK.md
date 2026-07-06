# Stack Research: vispeech

## Next.js App Router + TypeScript

- **Recommendation**: Next.js 14+ with App Router (stable since 13.4)
- **Rationale**: File-based routing for /auth, /dashboard, /practice/[word], /api/score, and API route co-location
- **Risk**: Low — mature framework
- **Version pin**: `next@14` or later

## Supabase

- **Recommendation**: `@supabase/supabase-js` v2 + `@supabase/ssr` for Next.js App Router
- **Auth**: email/password via `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()`
- **Database**: PostgreSQL with Row Level Security
- **Risk**: Low — well-documented, works with App Router
- **Note**: For server components, use `createServerClient` from `@supabase/ssr` with cookie handling

## MediaPipe Face Mesh

- **Recommendation**: `@mediapipe/face_mesh` + `@mediapipe/camera_utils` + `@mediapipe/drawing_utils`
- **Integration**: Runs in browser via WebAssembly; captures 468 facial landmarks
- **Risk**: Medium — WASM loading can be heavy; mobile browser support varies; need to handle loading states and graceful fallback
- **Fallback**: If MediaPipe fails to load or camera is denied, show demo mode with simulated mouth-detection animation

## Web Speech API

- **Recommendation**: Native `SpeechRecognition` API with `lang="th-TH"`
- **Risk**: High — Thai language support is browser-dependent:
  - Chrome: Best support for th-TH
  - Firefox: Not supported
  - Safari: Limited support
- **Fallback**: Detect availability; if unavailable, show Thai message and allow manual score entry
