# src/app/(app)/dashboard/

## Responsibility

Authenticated landing view showing learner progress per lesson. Aggregates static lesson definitions (`LESSONS`) with per-user practice data (words + `word_accuracy`) into progress cards, and renders historical practice results in a sidebar. Client-side route gate: redirects unauthenticated users to `/auth/signin`.

## Design

- **Client component** (`"use client"`): data fetching via `supabase.auth.getSession()` + direct Supabase queries, no server component. Env guard via `isSupabaseConfigured` renders `<SupabaseNotConfigured>`.
- **Container/presentational split**: `DashboardPage` (state + data) vs `LessonCard` (pure presentational, receives `LessonItem` prop) vs `DashboardSkeleton` (loading state).
- **Derived-state view model**: `realLessonItems` `useMemo` maps `LESSONS[]` → `LessonItem[]` (progress %, completed flags, highlighted warnings, avg accuracy). Pure derivation from `words` + `accuracy` state.
- **Join by text key**: lesson items joined to DB `words` by text match (`wordByText` Map); DB rows carry `id` used to look up `word_accuracy`.
- **Static fallback**: `/api/words` fetch fails → direct `supabase.from("words")` query (dual-source with try/catch).
- **Compound components**: shadcn/ui `Card`/`CardContent`, `Badge`, `Button`; lucide-react icons.
- **Sidebar pattern**: `PracticeResultSidebar` as controlled modal — `open`/`onClose`/`results`/`totalAccuracy` props drive visibility.

## Flow

1. Mount → `useEffect` (empty deps) → `loadData()`:
   - `supabase.auth.getSession()`; no session → `router.push("/auth/signin")` (also gates `/api/words` via `Authorization: Bearer <token>`).
   - Fetch words: `fetch("/api/words")` → map `{text, visemeGroup, difficulty}` → `Word`; on failure fallback `supabase.from("words").select(...)`.
   - Fetch accuracy: `supabase.from("word_accuracy").select("*").eq("user_id", session.user.id)` → `Record<word_id, WordAccuracy>`.
   - `setWords`, `setAccuracy`, `setLoading(false)`.
2. Render gate: `!isSupabaseConfigured` → `<SupabaseNotConfigured>`; `loading` → skeleton; zero items → empty state.
3. `useMemo` (deps `[words, accuracy]`): per lesson compute `completedWords` (count of lesson words with an accuracy row), `progressWidth`, `avgAccuracy` (mean of `average_score`), `highlighted`/`warning` (any `average_score < PASS_THRESHOLD` from `@/lib/constants`). Output `LessonItem[]`.
4. `LessonCard` renders; CTA per state:
   - Completed → "สรุปผล" (calls `handleSummaryClick(lessonWords)`) + "เริ่มการฝึกซ้ำ" → `router.push(lessonHref(group))` → `/practice/session?group=<id>`.
   - Not completed → "เริ่มการฝึก" → `lessonHref(group)`.
5. `handleSummaryClick`: re-checks session → `fetch("/api/practice-sessions")` → filters results to lesson words, dedupes by word (keep latest), maps to `WordResult[]` (status/expanded/feedback derived from `PASS_THRESHOLD` vs `total_score`, `visual_score`, `audio_score`) → `setSidebarResults`/`setSidebarAccuracy`/`setSidebarOpen(true)`.
6. Sidebar renders; "onRestart" → `/practice/session`; close → `setSidebarOpen(false)`.

## Integration

- **Consumed by**: (this is the leaf route `/dashboard` rendered inside AppShell layout under `(app)` group; authenticated user browsing to dashboard). No other code consumes this module.
- **Depends on**:
  - `@/lib/supabase/client` — `supabase`, `isSupabaseConfigured` (auth session, direct queries)
  - `@/lib/lesson` — `LESSONS`, `lessonHref` (`/practice/session?group=`)
  - `@/lib/constants` — `PASS_THRESHOLD` (75)
  - API routes: `GET /api/words`, `GET /api/practice-sessions` (bearer-token auth)
  - DB tables: `words`, `word_accuracy` (filtered by `user_id`)
  - `@/components/practice/PracticeResultSidebar` (`WordResult` type shared)
  - `@/components/SupabaseNotConfigured`, shadcn `Card`/`Badge`/`Button`, `next/image`, lucide icons
  - Navigation: `/auth/signin`, `/practice/session`
