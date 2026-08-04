# src/app/auth/callback/

## Responsibility

Client-side OAuth redirect target. Terminates the Supabase Google OAuth
handshake initiated from `/auth/signin`: verifies the session established by
the provider redirect, then forwards the browser to the authenticated
dashboard or back to sign-in with an error. Single-shot navigation handler —
renders a loading state, never a persistent UI.

## Design

- **Route as side-effect component**: the page is a `"use client"` component
  whose entire logic runs once inside `useEffect` via `handleCallback()`;
  render output is a pure loading spinner.
- **Named inner component + `Suspense` boundary**: `AuthCallbackContent` is
  wrapped in `Suspense` with a duplicated spinner fallback. Required because
  `useSearchParams()` in Next.js App Router triggers a client-side bailout /
  requires a suspense boundary during static prerendering.
- **Redirect-based control flow**: outcome communicated exclusively through
  `router.replace()` — no state, no response body, no data mutations.
- **Query-string error propagation**: provider errors (`error`,
  `error_description` query params) are re-encoded with
  `encodeURIComponent` and forwarded to the sign-in page.

## Flow

1. Supabase redirects the browser to `/auth/callback?code=...&state=...`
   (redirect target set by `signInWithOAuth({ redirectTo: origin + "/auth/callback" })`
   in `src/app/auth/signin/page.tsx`).
2. `AuthCallbackContent` mounts; `useEffect` fires `handleCallback()` once
   (deps: `[router, searchParams]`).
3. `searchParams.get("error")` — if truthy, `router.replace("/auth/signin?error=<encoded error_description|error>")` and return.
4. Otherwise calls `supabase.auth.getSession()` (browser client from
   `@/lib/supabase/client`), which resolves the session persisted from the
   OAuth code exchange (Supabase JS auto-handles the code flow).
5. Session present → `router.replace("/dashboard")`. Absent →
   `router.replace("/auth/signin?error=Session not found after OAuth")`.
6. Navigation replaces history entry; component unmounts.

## Integration

- Consumed by: browser navigation from Supabase OAuth redirect;
  `src/app/auth/signin/page.tsx` registers this route as `redirectTo`.
  Feeds `/dashboard` (authenticated app) or `/auth/signin` (error display).
- Depends on: `@/lib/supabase/client` (`supabase.auth.getSession`, requires
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`); Supabase
  Auth server-side session persistence after code exchange; Next.js
  `useRouter` / `useSearchParams` from `next/navigation`. Auth gate itself
  is client-side (see `src/proxy.ts` pass-through) — this page assumes no
  route-level protection on navigation to `/auth/callback`.
