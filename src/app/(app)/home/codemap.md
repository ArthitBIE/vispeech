# src/app/(app)/home/

## Responsibility

Authenticated dashboard landing page (`/`). Lesson browser + user progress surface: lists practice lessons from static catalog (`LESSONS`), overlays per-word accuracy from DB to derive per-lesson status (not-started / learning / done), and renders the practice-streak widget. Entry point that routes users into lesson practice flows.

## Design

- **Client component, route-level "page" pattern** (`"use client"` + default export) under the AppShell layout (`(app)/layout.tsx`).
- **Container/presentational-in-one**: all data fetching, derived-state computation, and rendering live in a single component; derivation isolated into `useMemo` selectors (`groupStatus`, `filteredLessons`, `filterCounts`, `wordByText`).
- **Server-route + bearer-token pattern**: authorized data (`/api/words`) fetched via `fetch` with `Authorization: Bearer <access_token>`; user-scoped rows (`word_accuracy`, `practice_logs`) queried directly with the browser Supabase client — token from `supabase.auth.getSession()`.
- **Client-side auth gate**: session absence redirects via `router.push("/auth/signin")`; unconfigured env short-circuits to `SupabaseNotConfigured` component.
- **Pure helper reuse**: streak math (`computeStreak`, `dateKey`, `thaiFullDate`) and lesson catalog/links (`LESSONS`, `lessonHref`) imported from `lib/`; status thresholds from shared constants (`PASS_THRESHOLD`, `STREAK_GOAL`).
- **Memoized filter/search toolbar**: local `filter` (Badge toggle) + `search` (Input) state; filtered list derived in `useMemo`, counts derived per filter key.

## Flow

1. Mount → `useEffect` calls `loadData()`.
2. `loadData`: bails if `isSupabaseConfigured` false; gets session via `supabase.auth.getSession()`; no session → `router.push("/auth/signin")`; else fetches `GET /api/words` (Bearer header) → `setWords`; queries `word_accuracy` by `user_id` → builds `Record<word_id, WordAccuracy>` → `setAccuracy`; queries `practice_logs.created_at` → `dateKey` each → `computeStreak` → `setStreakInfo`. `loading` cleared in `finally`.
3. Derived render state:
   - `wordByText`: `words` keyed by `text`.
   - `groupStatus`: per lesson, maps items → `wordByText`; no accuracy → `not-started`; all matched words ≥ `PASS_THRESHOLD` average → `done`; else `learning`.
   - `filteredLessons`: `LESSONS` filtered by `groupStatus` (unless `all`) and substring match on `name`.
   - `filterCounts`: per-status tally for badge labels.
4. Render: streak card (progress = `streak / STREAK_GOAL`), recommended-lesson CTA (`lessonHref(LESSONS[0].id)`), filter/search toolbar, lesson grid.
5. Out: `Link` navigation to `lessonHref(lesson.id)` (lesson detail/session routes) or `/practice/session` (empty-state fallback). Data exits only as navigation; no writes.

## Integration

- Consumed by: `(app)/layout.tsx` AppShell (rendered at route `/`); users navigate from here into `/practice/session` via `lessonHref`.
- Depends on:
  - `@/lib/supabase/client` — `supabase`, `isSupabaseConfigured`
  - `@/lib/lesson` — `LESSONS`, `lessonHref`, `Lesson` type
  - `@/lib/streak` — `computeStreak`, `dateKey`, `thaiFullDate`
  - `@/lib/constants` — `STREAK_GOAL`, `PASS_THRESHOLD`
  - `@/components/SupabaseNotConfigured`; UI kit (`Card`, `Input`, `Badge`, `Button`); `lucide-react` icons; `next/image`
  - Backend: `GET /api/words` (server route, Bearer auth); Supabase tables `word_accuracy`, `practice_logs`
