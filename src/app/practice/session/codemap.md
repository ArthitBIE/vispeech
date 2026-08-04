# src/app/practice/session/

## Responsibility

Client-side orchestrator for a single guided practice session. Loads a lesson's word list from the DB, initializes a practice session record, drives the per-word practice loop (via `PracticeWord`), aggregates per-word scores, persists session aggregates via PATCH, and hands off to `/summary`. Acts as the stateful parent/controller between lesson data, the practice engine, and session persistence.

## Design

- **Container/Presenter (Controller) pattern**: `PracticeSessionPage` (default export) is a thin `Suspense` wrapper; `PracticeSessionContent` owns all state and logic, delegating presentational practice UI to the `PracticeWord` child component.
- **Client Component** (`"use client"`) — all data fetching, scoring, and routing are browser-side.
- **Props-down / callbacks-up**: `PracticeWord` receives `word`, `sessionId` and emits `onScored(ScoreResult)`, `onSkip()`, `onLive(LiveState)`; the page lifts results/live state up for rendering and persistence.
- **Route query parameter as configuration**: `?group=<lessonId>` selects the lesson via `findLesson(groupParam)`; falls back to `LESSONS[0]`.
- **Lifting state / controlled progress**: `currentIndex` drives which word renders; `results` array (keyed by word id) is the source of truth for completion status, score display, and finish aggregation.
- **Idempotent result upsert**: `handleScored` replaces an existing result with the same `word.id` (re-practice overwrites).
- **Ad-hoc rendering based on state** (`activeLevel`, `currentIndex` position) for progress indicators and motivational copy.

## Flow

1. **Mount (initial effect, dep `groupParam`)**: `supabase.auth.getSession()` → captures `avatarLetter` from user email + `access_token` for authed fetches. Resolves lesson via `findLesson(groupParam ?? "") ?? LESSONS[0]`.
2. **Word loading**: `fetch("/api/words")` (Bearer auth) → builds `wordByText: Map<text, {id, visemeGroup}>` → maps `lesson.items` to `WordRow[]` (DB id when present, else synthetic `item.text` id) → `setWords`, `setActiveLevel(1)`.
3. **Session creation**: `POST /api/practice-sessions` with `{totalAttempts: 0, passedCount: 0, bestScore: 0}` → `setSessionId(id)` (skipped if unauthenticated; finish then routes directly to summary).
4. **Practice loop**: `currentWord()` = `filteredWords[currentIndex]` (filtered by `difficulty === activeLevel`). `PracticeWord` (keyed by word id → remount per word) runs camera face-mesh + speech recognition + TTS, calls `POST /api/score`, emits `onScored` → `handleScored` increments `totalAttempts`, derives `status` (total ≥ 75 = "success" else "warning"), Thai lip/sound feedback strings, and upserts `results`. `onLive` updates live mouth/audio/transcript meters in the tips sidebar.
5. **Advance**: `onSkip` → `currentIndex + 1` and resets `live`; on last word (or skip past end) → `handleFinish`.
6. **Finish**: `PATCH /api/practice-sessions` with `{sessionId, totalAttempts, passedCount (results status==="success"), bestScore (max of result scores, 0 if none)}` → `router.push("/summary?group=<lessonId>")`. Cancellation routes to `/dashboard`.
7. **Unmount**: effect sets `cancelled = true`, guarding async state updates after navigation.

## Integration

- **Consumed by**: `PracticeSessionPage` is the route handler for `/practice/session?group=<id>` (navigated to from `/home`/lesson UI). It pushes to `/summary?group=<lessonId>` on finish and `/dashboard` on cancel.
- **Depends on**:
  - `@/components/practice/PracticeWord` — practice engine (camera, recognition, scoring, emits `ScoreResult`/`LiveState`).
  - `@/lib/lesson` (`LESSONS`, `findLesson`) — lesson definitions to map to DB words.
  - `@/lib/supabase/client` — `getSession` for auth token + avatar letter.
  - `/api/words` — DB word list (GET).
  - `/api/practice-sessions` — session create (POST) and aggregate update (PATCH).
  - `/api/score` — called indirectly by `PracticeWord` for per-word scoring.
  - `@/components/ui/*` (Button, Card, Progress), `@/components/layout/AppBreadcrumb`, `next/image`, `lucide-react` — UI.
