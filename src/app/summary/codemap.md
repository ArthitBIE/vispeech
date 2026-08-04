# src/app/summary/

## Responsibility

Post-session results presentation page for the Thai pronunciation-training app. Reads the most recent practice session and per-word scores from the backend, and renders a completion summary (mascot, average accuracy, star rating, per-word pass/fail breakdown with expandable coaching feedback). Consumes session data; does not persist anything itself.

## Design

- **Client component with fetch-on-mount**: `page.tsx` is `"use client"`; a `useEffect` IIFE runs once (empty deps) and pulls data from `GET /api/practice-sessions` (reads server state, no URL params).
- **Cancellation guard pattern**: `cancelled` flag in the effect cleanup prevents `setState` after unmount (same pattern as `src/app/practice/session`).
- **Derived presentation state**: `totalAccuracy` computed via `reduce` over `results`; `starCount` derived from bucketed thresholds (5★ ≥90, 4★ ≥75, 3★ ≥60, 2★ ≥45, else 1★); `isSuccess` per word compares `total_score >= PASS_THRESHOLD` (75 from `@/lib/constants`).
- **Expandable list (client-side accordion)**: `expanded` is a `Set<string>` keyed by word; failed words (< threshold) auto-expand on load; `toggleExpanded` swaps a fresh `Set` copy (immutable update) to toggle chevron-rotated detail rows.
- **Conditional rendering state machine**: loading → error → empty (`!session || results.length === 0`) → success view; error/empty states offer recovery CTA to `/practice/session`.
- **Layout wrapper**: `layout.tsx` renders children inside `HeaderOnlyShell` (`@/components/layout/HeaderOnlyShell`).

## Flow

1. `SummaryLayout` (server) wraps `page.tsx` in `HeaderOnlyShell`.
2. `SummarizePage` mounts → `useEffect` IIFE: `supabase.auth.getSession()` for `access_token` → `fetch("/api/practice-sessions", { Authorization: Bearer ... })`.
3. On success: `setSession(data.session)`, `setResults(data.results)`; seeds `expanded` with every word whose `total_score < PASS_THRESHOLD`.
4. On non-OK response or exception: `setError(...)`; always `setLoading(false)` unless cancelled.
5. Render: computes `totalAccuracy` (mean of `total_score`) and `starCount`; maps `results` into rows — header button shows pass icon (`CheckCircle2` emerald) vs warning (`AlertTriangle` orange), word/phonetic/`total_score%`, and chevron; open rows show lip (`visual_score`) and sound (`audio_score`) feedback strings (Thai: "ถูกต้อง" when ≥ threshold, else "ปากกว้างไม่พอ"/"ระดับเสียงไม่ถูกต้อง") plus a recommendation hint for failed words.
6. User actions: `toggleExpanded(word)` toggles detail; `router.push("/practice/session")` (repeat practice / error / empty CTA); `router.push("/home")` (back home) / `/dashboard` not used here.

## Integration

- Consumed by: user navigation — reached via `router.push("/summary")` from `src/app/practice/session/page.tsx` (`handleFinish`); renders inside `(app)` root layout shell via `HeaderOnlyShell`.
- Depends on:
  - `GET /api/practice-sessions` (`src/app/api/practice-sessions/route.ts`) — supplies `session` (`id`, `total_attempts`, `passed_count`, `best_score`, `created_at`) and `results` (`word`, `phonetic`, `viseme_group`, `visual_score`, `audio_score`, `total_score`, `attempt_number`, `created_at`).
  - `src/lib/supabase/client` — `supabase.auth.getSession()` for the Bearer token.
  - `src/lib/constants` (`PASS_THRESHOLD = 75`) — pass/fail and per-dimension thresholds.
  - `@/components/ui/button`, `@/components/ui/card`, `lucide-react` icons, `next/image`, `next/link`, `next/navigation`.
