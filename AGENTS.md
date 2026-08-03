<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# vispeech — Project Agent Rules

## Stack

- **Next.js 16.2.10** (App Router) + React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Package manager: pnpm** (11.x, per `packageManager` field). Never use `npm` or `bun` for installs in this repo.
- **Supabase** backend (auth: email/password + Google OAuth; tables: words, practice_logs, word_accuracy, practice_sessions)
- **Tests**: Vitest (unit, in `src/lib/**/__tests__/`) + Playwright (e2e, in `e2e/`)

## Next.js 16 specifics that apply here

- **`proxy.ts` not `middleware.ts`** — the `middleware` filename/export is deprecated. The file lives at `src/proxy.ts` and exports `proxy(request)`. Proxy runs on the Node runtime (edge is not supported).
- Route protection is a pass-through in `src/proxy.ts`; the real auth gate is client-side session checks.
- The Next.js 16 docs in `node_modules/next/dist/docs/01-app/` are authoritative — read them before writing Next-specific code.

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm lint             # eslint
pnpm test:unit        # vitest (unit)
pnpm test:e2e         # playwright (e2e)
pnpm test             # both (also runs in husky pre-commit)
pnpm create-test-user # seed E2E test user into Supabase
```

- Husky pre-commit runs lint-staged (Prettier) + `vitest run && playwright test` — it will block commits with failing tests. Don't bypass it.
- Use `bunx tsc --noEmit` to type-check the whole project.

## Conventions

- **Routing**: authenticated app pages live under `src/app/(app)/` (dashboard, home, settings) and use the AppShell layout. Auth flows live under `src/app/auth/` (signin, signup, callback).
- **Practice flow**: lessons are defined in `src/lib/lesson.ts` (`LESSONS`: คำศัพท์, เสียงสระ, บทสนทนา). Session practice is `src/app/practice/session/page.tsx`; single-word practice is `src/app/practice/[word]/page.tsx`. Sessions complete to `/summary`.
- **TTS**: server route `src/app/api/tts/route.ts` (edge-tts-universal); client helper `src/lib/tts.ts`. Force-dynamic.
- **Scoring**: visual (mouth openness via MediaPipe) + audio (Web Speech transcript) → weighted total, persisted via `POST /api/score` and sessions via `/api/practice-sessions` (GET/POST/PATCH).
- **Supabase clients**: browser client in `src/lib/supabase/client.ts`; server-side API routes create a per-request client with the `Authorization: Bearer <token>` header. Use `.maybeSingle()` (not `.single()`) on queries that may return zero rows to avoid PGRST116 errors.
- **Env**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local`, gitignored). E2E uses `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`.
- **Middleware/proxy change**: if you touch `src/proxy.ts`, keep the same matcher and pass-through behavior.

## Docs

- `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`, `docs/CONFIGURATION.md` — read these before changing core flows.

## Verification

Before committing, ensure: `bunx tsc --noEmit`, `pnpm test:unit`, and the relevant e2e specs pass (`bunx playwright test e2e/<spec>.spec.ts`). The husky hook runs the full suite on commit anyway.
