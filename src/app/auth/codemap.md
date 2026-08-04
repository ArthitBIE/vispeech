# src/app/auth/

## Responsibility

Authentication route segment for the unauthenticated public-facing auth UI. Index route acts as a URL alias/redirector; the segment hosts the auth entry points (signin, signup, OAuth callback) for the Supabase-backed auth flow. No layout.tsx of its own — inherits the root layout at `src/app/layout.tsx`.

## Design

- **Index route as redirect shim**: `page.tsx` exports `AuthIndexPage`, a server component that calls `redirect("/auth/signin")` from `next/navigation`. `/auth` is not a landing page; it normalizes the URL to the canonical sign-in route.
- **Client-component auth pages**: all children (`signin/`, `signup/`, `callback/`) are `"use client"` components using the browser Supabase client (`@/lib/supabase/client`), consistent with the project rule that real auth gating is client-side (proxy is pass-through).
- **Route groups by auth step**: separate route segments per flow step — `signin/` (email/password + Google OAuth entry), `signup/` (registration), `callback/` (OAuth redirect handler) — each with its own `page.tsx` and `codemap.md`.
- **Error surfacing via query params**: OAuth failures are propagated to the UI as `?error=` / `?error_description=` query params on `/auth/signin`, read via `useSearchParams()`.

## Flow

1. User hits `/auth` → `AuthIndexPage` executes `redirect("/auth/signin")` (Next.js `next/navigation`), landing on the sign-in form.
2. Credential sign-in/sign-up: children call `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()` → on success `router.push("/dashboard")`; on failure error messages are mapped to Thai copy and rendered in-form.
3. Google OAuth: children call `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ${origin}/auth/callback } })` → browser leaves to Google → returns to `/auth/callback`.
4. Callback: `AuthCallbackContent` (wrapped in `Suspense`) reads query params in `useEffect`, checks `?error`, then calls `supabase.auth.getSession()` → if session exists `router.replace("/dashboard")`, else redirects to `/auth/signin?error=...`.
5. Auth index exits the module on success by client navigation to `/dashboard` (inside `(app)` route group); on failure stays within `/auth` with error state.

## Integration

- Consumed by: Root layout (`src/app/layout.tsx`, inherited). Post-auth, control passes to the `(app)` group's `/dashboard` page. Cross-links between `signin`/`signup` pages via `next/link`. Navigation header/footer link to `/` (home) and `/auth/signup`.
- Depends on: `next/navigation` (`redirect`, `useRouter`, `useSearchParams`); Supabase browser client `@/lib/supabase/client` (`supabase`, `isSupabaseConfigured`); shadcn/ui components (`Button`, `Input`, `Label`, `Card*`) and `@/components/layout/TitleLogo`; env vars `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `public/google-icon.svg`.
