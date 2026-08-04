# src/lib/

## Responsibility

Shared pure utility layer for the app router: static lesson curriculum data, browser TTS orchestration, streak/date math, practice result aggregation, styling merge helper, and app-wide constants. No UI, no persistence, no API calls.

## Design

- **Lesson config (static data)**: `LESSONS` is a declarative array of Thai lessons (`LessonItem[]` with text/phonetic/visemeGroup/difficulty), queried via `findLesson()` (case-insensitive id-or-name lookup) and `lessonHref()` (route builder). Legacy chunking API `chunkIntoLessons()`/`LessonWord`/`LessonChunk` retained for backward compat — groups by `visemeGroup`, slices into `LESSON_SIZE` (5) chunks.
- **TTS wrapper**: `speakThai()` wraps the browser Web Speech API — async voice discovery with `voiceschanged` + 1s timeout fallback (`getVoices()` memoized promise), single active-utterance tracking via `Symbol` id guard, progress derived from `onboundary` plus a 100ms timer (Google/OS voices rarely fire boundary events), idempotent `finish()` finalizer. `stopSpeaking()` cancels and clears state.
- **Streak computation (pure functions)**: `dateKey()` normalizes to UTC-day string; `computeStreak()` counts consecutive practiced days ending today (or yesterday, so an un-practiced today doesn't reset); `lastNDays()`, `thaiWeekdayShort()`, `thaiFullDate()` for calendar rendering.
- **Result aggregation**: `dedupeByBestScore()` keeps first-occurrence position but substitutes highest `total_score` attempt per word via Map.
- **Constants**: `PASS_THRESHOLD`, `STREAK_GOAL`, `SCORING_WEIGHTS` (single source of truth for thresholds).
- **Utility**: `cn()` — `clsx` + `tailwind-merge` compound class merger (shadcn/ui convention).

## Flow

- Home/dashboard pages read `LESSONS` + `lessonHref()` to render lesson cards → link to `/practice/session?group=...`; session page resolves the group via `findLesson()`.
- `PracticeWord` (practice session) calls `speakThai(text, { onProgress, onEnd, onError })` → Web Speech API voices → progress callbacks drive UI; `stopSpeaking()` on unmount/skip. Server-side `POST /api/practice-sessions` runs `dedupeByBestScore()` over recorded attempts before persisting the session.
- Home fetches practice dates → `computeStreak(dateKeys)` + `lastNDays()`/`thaiFullDate()` render streak + weekly calendar; `dateKey()` keys the practiced-day set.
- Summary/dashboard/sidebar read `PASS_THRESHOLD`/`STREAK_GOAL` for pass/goal UI; `scoring/` reads `SCORING_WEIGHTS` for the weighted score. UI components merge classes through `cn()`.

## Integration

- Consumed by: `src/app/(app)/home/page.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/practice/session/page.tsx`, `src/app/summary/page.tsx`, `src/app/api/practice-sessions/route.ts`, `src/components/practice/PracticeWord.tsx`, `src/components/layout/Sidebar.tsx`, `src/lib/scoring/index.ts`, all `src/components/ui/*` (via `cn`)
- Depends on: `clsx`, `tailwind-merge` (`utils.ts`); browser APIs `window.speechSynthesis`/`SpeechSynthesisUtterance` (`tts.ts`, client-only); `Intl.DateTimeFormat` (`streak.ts`); no dependency on scoring/mediapipe/viseme/supabase subfolders
