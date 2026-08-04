# src/lib/supabase/

## Responsibility

Supabase client factories: a shared browser singleton (`client.ts`) and a per-call server client (`server.ts`). Gate client creation behind env-var configuration checks so the app runs in unconfigured/dev mode instead of crashing.

## Design

- **Singleton browser client**: `client.ts` creates one `@supabase/supabase-js` client at module load, exported as `supabase`. Uses `persistSession` default (true) so the browser client manages the auth session via localStorage.
- **Config guard**: `isSupabaseConfigured` boolean checks both env vars exist and are not placeholder values (`https://placeholder.supabase.co` / `placeholder_anon_key`). Unguarded creation would emit a misleading "anon key is empty" error.
- **Null-object fallback**: both factories return `null as any` when unconfigured, after a `console.warn`. Callers must guard against null (e.g. check `isSupabaseConfigured` or optional-chain).
- **Per-request server client**: `server.ts` `createServerClient()` builds a fresh client per call with `auth.persistSession: false` — no session persistence on the server, each request passes its own auth state.
- Env vars read from `process.env` at call/module time (NEXT_PUBLIC_* inlined at build for browser, read at runtime on server).

## Flow

- `client.ts`: module load → read `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` → evaluate `isSupabaseConfigured` → `createSupabaseClient()` returns configured client or `null` → exported `supabase` used directly by browser components/pages for auth + data queries.
- `server.ts`: `createServerClient()` invoked per API route/server component call → env check → new `createClient(url, key, { auth: { persistSession: false } })` → returned for one request's lifetime. Server routes forward the caller's `Authorization: Bearer <token>` header to the client so Supabase can resolve the user session server-side (no cookie-based session on the server client).

## Integration

- Consumed by: browser client (`supabase`, `isSupabaseConfigured`) — `src/app/(app)/home/page.tsx`, `src/app/(app)/dashboard/page.tsx`, `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/callback/page.tsx`, `src/app/summary/page.tsx`, `src/app/practice/session/page.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Header.tsx`, `src/components/practice/PracticeWord.tsx`. Server client (`createServerClient`) — `src/app/page.tsx` and server-side API routes (e.g. `/api/tts`, `/api/score`, `/api/practice-sessions`) which use the `Authorization: Bearer` pattern.
- Depends on: `@supabase/supabase-js`, env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `.env.local`, gitignored).
