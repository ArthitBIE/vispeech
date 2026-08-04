# src/app/auth/signin/

## Responsibility

Client-side authentication entry point. Collects email/password credentials (or delegates to Google OAuth), authenticates against Supabase Auth, and routes authenticated users into the app. Single-page route: one `"use client"` component (`page.tsx`) rendering a standalone landing page (header, sign-in card, footer) with no shared layout.

## Design

- **Controlled form component**: `useState` drives `email`, `password`, `showPassword`, `error`, `loading` — no form library.
- **Facade over Supabase Auth**: imports `supabase` and `isSupabaseConfigured` from `@/lib/supabase/client`; all auth I/O goes through that facade, never direct SDK construction.
- **Feature guard**: `isSupabaseConfigured` gate before any auth call — fails fast with a Thai-language setup message when `.env.local` vars are missing.
- **Error message mapping**: `Record<string, string>` translates known Supabase error strings (`"Invalid login credentials"`, `"Email not confirmed"`) to Thai UI copy; unknown messages pass through verbatim.
- **UI**: shadcn/ui primitives (`Card`, `Button`, `Input`, `Label`) + lucide icons; Thai/English mixed copy.
- **Route-level separation**: standalone page (not under `(app)` layout) — intentional, auth pages are pre-auth and exclude AppShell.

## Flow

1. User submits form → `handleSubmit(e)` (preventDefault) → clears `error`.
2. Guard: if `!isSupabaseConfigured || !supabase?.auth` → set Thai setup `error`, return.
3. `setLoading(true)` → `await supabase.auth.signInWithPassword({ email, password })`.
4. Success (`error` null) → `router.push("/dashboard")`; failure → thrown error mapped via `messages` record → `setError`.
5. `finally` → `setLoading(false)`; submit button disabled while loading, label switches to "กำลังเข้าสู่ระบบ...".
6. Google path: `handleGoogleLogin()` → same guard → `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } })` → OAuth handoff to `/auth/callback`; errors → `setError`.
7. State transitions: idle → loading (submit/oauth) → either `router.push("/dashboard")` (email) or external redirect (OAuth) or error state with `role="alert"` banner.
8. Password visibility toggle: `showPassword` flips `Input type` between `password`/`text` with `Eye`/`EyeOff` icon.

## Integration

- **Consumed by**: none at component level — routed by Next.js App Router at `/auth/signin`. Navigation targets it: header `Link`s (`/auth/signup` page cross-links to it via "Login" button). Session-protected routes (`/dashboard`) receive its successfully authenticated users.
- **Depends on**:
  - `@/lib/supabase/client` — `supabase` (browser client) + `isSupabaseConfigured` flag.
  - `@/components/ui/{button,input,label,card}` — shadcn/ui primitives.
  - `@/components/layout/TitleLogo` — brand header.
  - `@/lib/tts`-style internal libs: none; relies only on Supabase Auth SDK methods `signInWithPassword`, `signInWithOAuth`.
  - External: Supabase Auth backend (email/password + Google OAuth provider); `/auth/callback` route (OAuth redirect target); Next.js `useRouter` (client navigation).
