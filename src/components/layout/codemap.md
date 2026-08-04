# src/components/layout/

## Responsibility

Layout composition layer for the app. Provides shell components (page chrome: header, navigation, content frame) and shared chrome primitives (breadcrumb, logo). Route groups select a shell via their `layout.tsx` to wrap child pages. Pure presentational composition — no business logic, no data fetching at the shell level (data fetching lives in `Sidebar`/`Header`).

## Design

- **Shell variants (composition root pattern):** three wrapper components that render the same `<div className="flex min-h-screen flex-col bg-background">` base with different chrome:
  - `AppShell` — full layout: `Header` + responsive `Sidebar` (desktop static, mobile via shadcn `Sheet` drawer) + `<main>` content. Uses local `useState` for drawer visibility.
  - `HeaderOnlyShell` — `Header` with `alignToContent` + narrower `<main>` padding. For focused pages (summary).
  - `BareShell` — renders `children` only, no chrome. For immersive flow (session practice).
- **Presentation/container split:** `Header` and `Sidebar` are the presentational subcomponents; shells compose them. `Sidebar` accepts optional `onNavigate` callback so the mobile Sheet can close itself on link click.
- **Sidebar navigation model:** static `NAV` array (href/label/icon) mapped to `<Link>`s; active state derived from `usePathname()` (exact match or prefix match).
- **Chrome primitives:** `TitleLogo` (static brand image, default export) and `AppBreadcrumb` (declarative `items: AppBreadcrumbItem[]` prop → shadcn `Breadcrumb`; first item gets Home icon, items without `href` render as non-link `BreadcrumbPage`).

## Flow

- **AppShell:** `useState(false)` for `open` → desktop `<Sidebar>` always rendered (hidden below `lg`); mobile `Sheet` (side="left", w-[266px]) mounts a second `<Sidebar onNavigate={() => setOpen(false)}>` → nav click closes drawer. Children render in `<main>`.
- **Header data flow:** on mount `useEffect` → `supabase.auth.getSession()` → sets `avatarLetter` (first char of email, uppercase, fallback "ก") and `avatarUrl` (from `user_metadata.avatar_url` or `picture`); cancelled flag guards unmounted setState. Avatar triggers shadcn `DropdownMenu` → `router.push("/settings")` (โปรไฟล์) or `/auth` (ออกจากระบบ).
- **Sidebar data flow:** on mount `useEffect` → `supabase.auth.getSession()`, then `supabase.from("practice_logs").select("created_at")` → `dateKey()` map → `computeStreak(keys)` returns `{streak, startDate}` → local state drives streak card (Thai date via `thaiFullDate`, 5-day flame strip via `lastNDays(5)`/`thaiWeekdayShort`, progress bar vs `STREAK_GOAL` from `@/lib/constants`). Fetch errors swallowed → defaults kept.
- **Breadcrumb flow:** caller (e.g. `practice/session/page.tsx`) passes `items` prop; component maps to `BreadcrumbItem`/`BreadcrumbSeparator` chain, rendering `Link` or plain page label.

## Integration

- Consumed by:
  - `src/app/(app)/layout.tsx` → `AppShell` (authenticated app pages: home, dashboard, settings)
  - `src/app/summary/layout.tsx` → `HeaderOnlyShell` (summary)
  - `src/app/practice/layout.tsx` → `BareShell` (session practice flow)
  - `AppBreadcrumb` → `src/app/practice/session/page.tsx`
  - `TitleLogo` → `Header`, `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`
- Depends on:
  - shadcn/ui primitives: `Sheet`, `Avatar`, `DropdownMenu`, `Breadcrumb`, `Card`
  - `@/lib/supabase/client` (browser Supabase client; `Header`, `Sidebar`)
  - `@/lib/streak` (`computeStreak`, `dateKey`, `lastNDays`, `thaiFullDate`, `thaiWeekdayShort`) and `@/lib/constants` (`STREAK_GOAL`)
  - Next.js: `next/link`, `next/image`, `next/navigation` (`usePathname`, `useRouter`)
  - lucide-react icons; static assets `/title-top-left.svg`, `/mascot/image 5.png`, `/mascot/image 6.png`
