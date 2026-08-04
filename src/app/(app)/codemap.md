# src/app/(app)/

## Responsibility

URL-neutral Route Group (App Router) defining the authenticated application shell for the main logged-in UI. Hosts the `dashboard/`, `home/`, and `settings/` route segments; the group itself contributes only a layout (no `page.tsx`).

## Design

- **Route Group pattern**: parentheses in `(app)` keep the segment out of the URL while grouping routes under one shared layout.
- **AppShell layout pattern** (Container/Composition): `layout.tsx` is a server component that passes `children` through to `AppShell` (`src/components/layout/AppShell.tsx`), a client component composing `Header` (top bar), `Sidebar` (navigation), and `main` content. Navigation is responsive: static `Sidebar` on `lg+` screens, `Sheet` drawer (mobile) toggled via `useState`.
- **Shell-only segment**: no page at group root — every route resolves to a child segment page rendered inside `AppShell`.

## Flow

1. Browser requests an authenticated route (e.g. `/dashboard`) → root layout (`src/app/layout.tsx`) renders `html`/`body`, Thai font, and Vercel `SpeedInsights`/`Analytics`.
2. `(app)/layout.tsx` receives `children` and renders `<AppShell>{children}</AppShell>`.
3. `AppShell` renders `Header`, desktop `Sidebar`, mobile `Sheet` containing `Sidebar`, then `<main>{children}</main>`.
4. `children` resolves to the matching segment page (`dashboard/`, `home/`, or `settings/`), which performs its own client-side session gating (proxy at `src/proxy.ts` is pass-through).
5. Mobile navigation: `AppShell` `open` state → `Sheet onOpenChange` → `Sidebar onNavigate` closes the drawer after route change.

## Integration

- Consumed by: Next.js router — renders child segment pages (`dashboard/`, `home/`, `settings/`) inside the shell; nested under root layout `src/app/layout.tsx`.
- Depends on: `AppShell` (`src/components/layout/AppShell.tsx`), which depends on `Header`, `Sidebar`, and shadcn/ui `Sheet`; child pages depend on client-side Supabase session checks.
