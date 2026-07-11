<!-- generated-by: gsd-doc-writer -->
# Configuration

ViSpeech uses environment variables for secrets and runtime settings, and standard configuration files for tooling. All environment variables are loaded from `.env.local` at the project root.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL from Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon/public (client-safe) API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts | — | Supabase service_role key; required only for `scripts/create-test-user.ts` |
| `E2E_TEST_EMAIL` | Tests | `test@vispeech.com` | Test user email for Playwright E2E tests |
| `E2E_TEST_PASSWORD` | Tests | `test123456` | Test user password for Playwright E2E tests |
| `CI` | No | — | When set, Playwright uses 2 retries, 1 worker, and starts a fresh dev server |

### Required (startup failure if missing)

- **`NEXT_PUBLIC_SUPABASE_URL`** — The project will boot but behavior varies by endpoint: `GET /api/words` returns status `500` with `{ error: "Supabase not configured" }`; `POST /api/practice-sessions` returns `{ id: null }` (200); `POST /api/score` would throw at runtime and return `{ error: "Internal server error" }` (500). Both the client-side and server-side Supabase helpers (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`) check for this value and emit a warning if it is missing or set to the placeholder value.

- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — Same behavior as `NEXT_PUBLIC_SUPABASE_URL`: the app runs but database operations fail.

### Required for scripts

- **`SUPABASE_SERVICE_ROLE_KEY`** — Needed only by `scripts/create-test-user.ts` to create test users via the Supabase Admin API. The script will exit with an error if this variable and `NEXT_PUBLIC_SUPABASE_URL` are not set.

### Optional (defaults apply)

- **`E2E_TEST_EMAIL`** / **`E2E_TEST_PASSWORD`** — Used by Playwright E2E tests (`e2e/`) and the test user creation script (`scripts/create-test-user.ts`). If unset, the script falls back to `test@vispeech.com` / `test123456`.

- **`CI`** — When set (typically by CI/CD platforms like GitHub Actions), Playwright adjusts: `forbidOnly: true`, `retries: 2`, `workers: 1`, and `reuseExistingServer: false`.

### Demo / Placeholder Mode

If `NEXT_PUBLIC_SUPABASE_URL` is set to `https://placeholder.supabase.co`, the Supabase client returns `null` and all database operations are skipped. API endpoints that require authentication return `401`, and write operations return `{ id: null }` or error responses. This allows the UI to render and MediaPipe/Web Speech API features to be tested without a live Supabase instance.

## Setup

Create a `.env.local` file in the project root:

```env
# Supabase project credentials
# Get these from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# (Optional) Service role key — only needed for scripts
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# (Optional) E2E test user
E2E_TEST_EMAIL=your-test-user@example.com
E2E_TEST_PASSWORD=your-test-password
```

Copy from the example template:

```bash
cp .env.local.example .env.local
```

<!-- VERIFY: SUPABASE_SERVICE_ROLE_KEY is not in .env.local.example but is required by scripts/create-test-user.ts. Add it manually if you need to run that script. -->

## Config Files

### `next.config.ts`
**Location:** `/next.config.ts`

Standard Next.js configuration. The only customization is `serverExternalPackages` which forces `@mediapipe/face_mesh` and `@mediapipe/camera_utils` to load as CommonJS on the server:

```ts
serverExternalPackages: [
  "@mediapipe/face_mesh",
  "@mediapipe/camera_utils",
],
```

This prevents Next.js from trying to bundle these native Node.js packages with the client bundle.

### `tsconfig.json`
**Location:** `/tsconfig.json`

Standard Next.js TypeScript configuration with strict mode enabled. Path alias:

```
@/* → ./src/*
```

### `eslint.config.mjs`
**Location:** `/eslint.config.mjs`

Uses `eslint-config-next` with Flat Config format (ESLint v9). Run with `npm run lint`.

### `postcss.config.mjs`
**Location:** `/postcss.config.mjs`

PostCSS pipeline using `@tailwindcss/postcss` (Tailwind CSS v4 PostCSS plugin).

### `vitest.config.ts`
**Location:** `/vitest.config.ts`

Unit test configuration:
- **Environment:** `jsdom` (simulates browser DOM)
- **Globals:** enabled
- **Excludes:** `e2e/`, `.opencode/`, `node_modules/`
- **Path alias:** `@/*` → `./src/*`
- Run with: `npm run test:unit`

### `playwright.config.ts`
**Location:** `/playwright.config.ts`

E2E test configuration:
- **Test directory:** `./e2e`
- **Base URL:** `http://localhost:3000`
- **Projects:** `setup`, `unauthenticated`, `authenticated`
- **Web server:** auto-starts `npm run dev`; reuses existing server locally
- Run with: `npm run test:e2e`

## Per-Environment Overrides

ViSpeech does not use dedicated `.env.development`, `.env.production`, or `.env.test` files. All environment variables are loaded from `.env.local` regardless of the runtime environment.

The `NODE_ENV` variable is managed internally by Next.js and does not need to be set manually.

The only environment-aware behavior is the `CI` variable, which adjusts Playwright's retry/worker settings when running in CI pipelines.

## Supabase Database Configuration

Database schema is defined in two migration files under `supabase/migrations/`:

| File | Contents |
|------|----------|
| `001_schema.sql` | Core tables: `words`, `word_accuracy`, `practice_logs` |
| `002_practice_sessions.sql` | `practice_sessions` table |

Seed data (`supabase/seed.sql`) inserts 32 Thai practice words across 7 viseme groups.

Apply migrations and seed data via the Supabase CLI:

```bash
npx supabase db push
npx supabase db seed
```

See [GETTING-STARTED.md](GETTING-STARTED.md) for step-by-step database setup instructions.
