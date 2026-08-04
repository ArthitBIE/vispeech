# src/app/practice/

## Responsibility

Client-side practice orchestration layer for the Thai pronunciation training app. Hosts the session-based lesson practice flow (`session/`) that renders the shared `PracticeWord` scoring widget, manages the practice-session lifecycle, and hands results off to `/summary`.

## Design

- **Layout wrapper**: `layout.tsx` wraps all practice routes in `BareShell` (browser viewport shell), delegating chrome to `@/components/layout/BareShell`.
- **Query-param-driven session**: `session/page.tsx` reads `?group=` from `useSearchParams`, resolves the lesson via `findLesson(groupParam) ?? LESSONS[0]` (from `@/lib/lesson`), and maps static lesson items onto DB-backed word ids fetched from `/api/words`.
- **Component re-mount per word**: `PracticeWord` gets `key={filteredWords[currentIndex]?.id}`, forcing a fresh scoring component (fresh MediaPipe/WebSpeech state) per word.
- **State machine (client)**: loading → error | empty | practicing; word index advanced by `handleScored`/`handleSkip`; completion via `handleFinish` → `router.push("/summary")`.
- **Guard pattern**: cancellation flag (`cancelled`) in every `useEffect` async IIFE to prevent setState after unmount.
- **Suspense boundary**: `PracticeSessionPage` wraps content in `<Suspense>` for `useSearchParams` (Next.js CSR bailout requirement).

## Flow

1. `session/page.tsx` mounts → `PracticeSessionContent` reads `group` param.
2. `useEffect` IIFE: `supabase.auth.getSession()` for token → `GET /api/words` (Bearer header) → builds `wordByText` Map → maps lesson items to `WordRow[]` (synthetic id `item.text` when word absent from DB) → `POST /api/practice-sessions` (`totalAttempts:0, passedCount:0, bestScore:0`) → stores `sessionId`.
3. `PracticeWord` receives `word`, `sessionId`, `onScored`, `onSkip`, `onLive`; emits `ScoreResult` via `onScored` (score saved to DB inside `PracticeWord` via `/api/score`).
4. `handleScored` increments `totalAttempts`, derives `PracticeWordResult` (status `success` if total ≥ 75 else `warning`, per-dimension Thai feedback strings, `expanded` when < 75), upserts into `results` by word id.
5. `handleSkip` advances `currentIndex` and resets `live` state; on last word calls `handleFinish`.
6. `handleFinish`: `GET session` token → `PATCH /api/practice-sessions` (`sessionId, totalAttempts, passedCount, bestScore`) → `router.push("/summary")`.

## Integration

- Consumed by: `src/app/(app)/home/page.tsx` (entry links to practice routes); session results flow into `src/app/summary/page.tsx`.
- Depends on:
  - `src/components/practice/PracticeWord` (`PracticeWord`, `WordRow`, `ScoreResult`, `LiveState`) — core scoring widget (MediaPipe visual + Web Speech audio).
  - `src/lib/lesson` (`LESSONS`, `findLesson`) — lesson definitions.
  - `src/lib/supabase/client` — browser Supabase client (auth + `words` table reads).
  - API routes: `GET /api/words`, `POST/PATCH /api/practice-sessions`, `POST /api/score` (inside PracticeWord).
  - `src/components/layout/BareShell`, `AppBreadcrumb`, `@/components/ui/{button,card,progress}`.
