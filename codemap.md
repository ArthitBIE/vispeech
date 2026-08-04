# Repository Atlas: vispeech

## Project Responsibility

A Thai pronunciation practice web app built with Next.js 16 (App Router) and Supabase. Provides structured lessons (Vocabulary, Vowel Sounds, Conversation), session-based practice with real-time visual (MediaPipe mouth openness) and audio (Web Speech API) scoring, TTS playback, and progress tracking.

## System Entry Points

- `src/proxy.ts` — Next.js 16 proxy (pass-through auth gate, Node runtime)
- `src/app/layout.tsx` — Root layout, providers, global styles
- `src/app/page.tsx` — Landing redirect to `/dashboard` or `/auth/signin`
- `src/app/(app)/layout.tsx` — AppShell layout (Header, Sidebar, mobile drawer) for authenticated routes
- `src/app/api/tts/route.ts` — Edge TTS streaming endpoint (th-TH-PremwadeeNeural)
- `src/app/api/score/route.ts` — Score submission + persistence (word_accuracy, practice_logs)
- `src/app/api/words/route.ts` — Lesson-filtered word list with accuracy joins
- `src/app/api/practice-sessions/route.ts` — Session CRUD (GET/POST/PATCH) with best-score dedupe
- `src/lib/supabase/client.ts` — Browser Supabase singleton
- `src/lib/supabase/server.ts` — Per-request server client with Bearer token forwarding
- `src/lib/lesson.ts` — Static lesson configuration (LESSONS, lessonHref, findLesson)
- `src/lib/scoring/index.ts` — Visual + audio scoring strategy (0.7/0.3 weight), MediaPipe landmarks, Web Speech transcript comparison

## Directory Map (Aggregated)

| Directory                        | Responsibility Summary                                                                                        | Detailed Map                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/app/`                       | Root App Router layout, landing redirect, global styles, proxy pass-through                                   | [View Map](src/app/codemap.md)                       |
| `src/app/(app)/`                 | Authenticated route group with AppShell layout (dashboard, home, settings)                                    | [View Map](<src/app/(app)/codemap.md>)               |
| `src/app/(app)/dashboard/`       | Auth-gated lesson progress view with word cards + accuracy sidebar                                            | [View Map](<src/app/(app)/dashboard/codemap.md>)     |
| `src/app/(app)/home/`            | Lesson list with streak, search/filter, direct Supabase + API data fetching                                   | [View Map](<src/app/(app)/home/codemap.md>)          |
| `src/app/(app)/settings/`        | Client-only settings: mic test, device enumeration, localStorage persistence                                  | [View Map](<src/app/(app)/settings/codemap.md>)      |
| `src/app/auth/`                  | Auth route segment with index redirect to signin                                                              | [View Map](src/app/auth/codemap.md)                  |
| `src/app/auth/signin/`           | Email/password + Google OAuth sign-in, Supabase configured guard                                              | [View Map](src/app/auth/signin/codemap.md)           |
| `src/app/auth/signup/`           | Registration with email/password + OAuth, redirect to callback                                                | [View Map](src/app/auth/signup/codemap.md)           |
| `src/app/auth/callback/`         | OAuth redirect terminator, code exchange, error propagation via query params                                  | [View Map](src/app/auth/callback/codemap.md)         |
| `src/app/api/`                   | Route handler aggregation: TTS, words, score, practice-sessions                                               | [View Map](src/app/api/codemap.md)                   |
| `src/app/api/tts/`               | Streaming Edge TTS (th-TH-PremwadeeNeural), force-dynamic, Node runtime                                       | [View Map](src/app/api/tts/codemap.md)               |
| `src/app/api/words/`             | Lesson-filtered word list with phonetic fallback + accuracy join                                              | [View Map](src/app/api/words/codemap.md)             |
| `src/app/api/score/`             | POST scoring submission, word_accuracy upsert + practice_logs insert                                          | [View Map](src/app/api/score/codemap.md)             |
| `src/app/api/practice-sessions/` | Session CRUD (GET/POST/PATCH), user-scoped, best-score dedupe, schema fallback                                | [View Map](src/app/api/practice-sessions/codemap.md) |
| `src/app/practice/`              | Practice orchestration: session flow                                                                          | [View Map](src/app/practice/codemap.md)              |
| `src/app/practice/session/`      | Multi-word session controller: load → POST → per-word loop → PATCH → summary                                  | [View Map](src/app/practice/session/codemap.md)      |
| `src/app/summary/`               | Post-session results: fetch session, star-rating buckets, failed-word accordion                               | [View Map](src/app/summary/codemap.md)               |
| `src/components/`                | Component composition layer: layout shells, practice components, shadcn/ui primitives                         | [View Map](src/components/codemap.md)                |
| `src/components/layout/`         | 3 shell variants (AppShell/HeaderOnlyShell/MinimalShell), Header/Sidebar/Sheet drawer, NAV model              | [View Map](src/components/layout/codemap.md)         |
| `src/components/practice/`       | PracticeWord (ref-based MediaPipe + Web Speech dual scoring, TTS fallback), LipExample, PracticeResultSidebar | [View Map](src/components/practice/codemap.md)       |
| `src/components/ui/`             | 18 shadcn/ui primitives (Button, Card, Dialog, etc.) with CVA variants, Radix composition                     | [View Map](src/components/ui/codemap.md)             |
| `src/lib/`                       | Core utilities: lesson config, TTS wrapper, streak math, practice summary, constants, cn()                    | [View Map](src/lib/codemap.md)                       |
| `src/lib/scoring/`               | Visual + audio scoring strategy (0.7/0.3), MediaPipe landmarks, heuristic ladders, Vitest coverage            | [View Map](src/lib/scoring/codemap.md)               |
| `src/lib/mediapipe/`             | MediaPipe Face Landmarker (lazy CDN load, WASM, landmarks 13/14 × 500 clamp, demo fallback)                   | [View Map](src/lib/mediapipe/codemap.md)             |
| `src/lib/viseme/`                | SpeechRecognizer adapter (Web Speech API, fallback strategy, Thai error mapping, restart guards)              | [View Map](src/lib/viseme/codemap.md)                |
| `src/lib/supabase/`              | Browser singleton + per-request server client, config guard, null-object fallback, maybeSingle() pattern      | [View Map](src/lib/supabase/codemap.md)              |
| `src/types/`                     | Ambient declarations: Web Speech API globals, MediaPipe module shims                                          | [View Map](src/types/codemap.md)                     |
