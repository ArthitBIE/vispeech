# src/app/

## Responsibility

Next.js App Router entry point: root layout, root page redirect, global styles, and route-level request filtering (proxy). Defines the document shell, metadata, theming tokens, and the "/" landing behavior for the Thai pronunciation-training app.

## Design

- **Root layout hierarchy**: `layout.tsx` is the root layout wrapping all routes; `(app)/`, `auth/`, `practice/`, `summary/`, `api/` are route groups/segments rendered as `children`.
- **Font + design tokens**: `IBM_Plex_Sans_Thai` loaded via `next/font/google`, exposed as CSS variable `--font-ibm-plex-sans-thai`; Tailwind 4 `@theme inline` maps semantic tokens (`--color-primary`, `--color-brand`, etc.) to CSS custom properties defined in `:root`/`.dark`.
- **Proxy pattern (Next 16)**: `src/proxy.ts` exports `proxy(request)` (replaces deprecated `middleware`), a pass-through router — no redirects; protection is deferred to client-side session checks.
- **Server-rendered redirect**: root `page.tsx` is an async server component that checks Supabase session and redirects.

## Flow

1. Request for any route first hits `src/proxy.ts` `proxy()`, which matches `/((?!_next/static|_next/image|favicon.ico).*)`; returns `NextResponse.next()` unconditionally (paths `/`, `/auth`, `/api`, `/_next`, `/favicon` are explicit no-ops; all others also pass through).
2. Request to `/` renders `page.tsx`: calls `createServerClient()` from `@/lib/supabase/server`, awaits `supabase.auth.getSession()`; if session exists redirects to `/home`, otherwise also redirects to `/home` (both branches converge — unauthenticated users are sent to the client-side auth gate).
3. Every rendered page mounts inside `RootLayout`: `<html lang="th">` applies the font variable class, `<body>` renders `{children}` plus `<SpeedInsights />` and `<Analytics />`; `globals.css` supplies Tailwind utilities and `:root`/`.dark` token values used by shadcn/ui components.

## Integration

- Consumed by: browser entry (all routes inherit root layout/metadata); `(app)/`, `auth/`, `practice/`, `summary/` pages render as `children`; Vercel SpeedInsights/Analytics injected globally.
- Depends on: `@/lib/supabase/server` (`createServerClient`) in `page.tsx`; `next/font/google`; `@vercel/speed-insights/next`; `@vercel/analytics/next`; Tailwind CSS 4; `src/proxy.ts` runs at request edge before any layout/page render.
