# src/app/auth/signup/

## Responsibility

Client-side registration page (`page.tsx`) that captures email/password/confirm-password and creates a user account via Supabase Auth. Handles two registration paths: email/password signup and Google OAuth signup. Owns form state, client-side validation, error localization (EN→TH), and post-signup navigation.

## Design

- **"use client" page component** — App Router client component; all auth logic runs in the browser against the Supabase JS client, no server route involved.
- **Controlled form state** — six `useState` hooks drive the form (`email`, `password`, `confirmPassword`, `showPassword`, `showConfirmPassword`, `error`, `loading`); inputs bind `value`/`onChange`.
- **Guard clause pattern** — `handleSubmit` and `handleGoogleLogin` both short-circuit with a Thai error message when `isSupabaseConfigured` is false (env-missing failsafe) before touching `supabase.auth`.
- **Error translation map** — `Record<string, string>` mapping Supabase error messages to Thai; falls back to raw `err.message` for unmapped errors.
- **Local error UI** — inline `role="alert"` paragraph instead of toast; disables both submit buttons via shared `loading` flag.
- **shadcn/ui composition** — `Card`/`Button`/`Input`/`Label` primitives; `lucide-react` Eye/EyeOff icons toggle password visibility.

## Flow

1. User submits form → `handleSubmit(e)` → `e.preventDefault()`, clears `error`.
2. Client-side validation: `password !== confirmPassword` → sets Thai mismatch error, returns early (no network).
3. Env check: `!isSupabaseConfigured || !supabase?.auth` → sets Thai config error, returns early.
4. Sets `loading=true` → `supabase.auth.signUp({ email, password })` → on success `router.push("/dashboard")`; on error caught, mapped via `messages` dict into `setError`; `finally` resets `loading=false`.
5. Google path: `handleGoogleLogin()` → same env guard → `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: \`${window.location.origin}/auth/callback\` } })`— OAuth redirects out-of-band; the`/auth/callback` route completes the session.
6. Data exits only via Supabase Auth (browser → Supabase API). No local persistence, no server round-trip in this module.
7. Cross-link: footer links to `/auth/signin` for existing users; header links home `/`.

## Integration

- Consumed by: App Router at route `/auth/signup`; success navigates to `/dashboard`; Google OAuth hands off to `/auth/callback`; links to `/auth/signin`.
- Depends on: `@/lib/supabase/client` (`supabase`, `isSupabaseConfigured` — lazily-created singleton, `null` when env missing), `@/components/ui/{button,input,label,card}`, `@/components/layout/TitleLogo`, `next/navigation` `useRouter`, `next/link`, `next/image`, `lucide-react`; static asset `/google-icon.svg`.
