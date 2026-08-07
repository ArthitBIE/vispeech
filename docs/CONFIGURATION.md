<!-- generated-by: gsd-doc-writer -->

# Configuration

ViSpeech uses environment variables for secrets and runtime settings, and standard configuration files for tooling. All environment variables are loaded from `.env.local` at the project root.

## Environment Variables

| Variable                        | Required | Default             | Description                                                                  |
| ------------------------------- | -------- | ------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | —                   | Supabase project URL from Project Settings → API                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | —                   | Supabase anon/public (client-safe) API key                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Scripts  | —                   | Supabase service_role key; required only for `scripts/create-test-user.ts`   |
| `E2E_TEST_EMAIL`                | Tests    | `test@vispeech.com` | Test user email for Playwright E2E tests                                     |
| `E2E_TEST_PASSWORD`             | Tests    | `test123456`        | Test user password for Playwright E2E tests                                  |
| `CI`                            | No       | —                   | When set, Playwright uses 2 retries, 1 worker, and starts a fresh dev server |

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

## Supabase Auth Redirect URLs (OAuth)

Google OAuth is configured in the Supabase Dashboard, not in this repo. Two
settings there decide where a user lands after signing in:

| Setting           | Where                              | Effect                                                                                   |
| ----------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **Site URL**      | Authentication → URL Configuration | Fallback destination. Used whenever the requested `redirect_to` is **not** allow-listed. |
| **Redirect URLs** | Authentication → URL Configuration | Allow-list of permitted `redirect_to` values.                                            |

### Matching is exact, and failure is silent

Supabase compares `redirect_to` against the allow-list **exactly** unless the
entry contains a `**` wildcard. A non-matching value is not rejected with an
error: it is silently replaced by the Site URL, and sign-in continues. The
symptom is "login works but sends me to the wrong environment", which looks
like a code bug and is not.

This is why `src/app/auth/signin/page.tsx` and `signup/page.tsx` request a
bare `${window.location.origin}/auth/callback` with **no query string**. Adding
`?next=/home` makes the value stop matching the allow-listed
`http://localhost:3000/auth/callback`, so local sign-in silently redirects to
production. The callback page already defaults `next` to `/home`, so the
parameter is unnecessary. Do not reintroduce it unless the allow-list entry
uses a wildcard.

### Required allow-list entries

```
http://localhost:3000/auth/callback
https://vispeech-pi.vercel.app/auth/callback
```

### Vercel preview deployments

Preview URLs are generated per branch and per build, so they cannot be listed
individually ahead of time. They are covered by wildcard entries:

```
https://vispeech-*-arthitbies-projects.vercel.app
https://vispeech-*-arthitbies-projects.vercel.app/**
```

Note the Vercel team slug is `arthitbies-projects`. A URL built with the wrong
slug is simply not allow-listed and silently falls back to the Site URL.

### Never add a bare `https://*.vercel.app` entry

Such an entry allow-lists **every** site on `vercel.app`, including ones owned
by other people. Because Supabase returns the session in the URL fragment,
anyone who can deploy any project to `vercel.app` can send a victim a link to
the authorize endpoint with their own domain as `redirect_to` and receive that
user's `access_token`, `refresh_token`, and Google `provider_token`. That is a
full account takeover needing no interaction beyond clicking a link.

This entry was present on the project and has been removed. Keep wildcards
anchored to a project-and-team-specific prefix, as above, so they cannot match
a third-party host.

### Verifying an allow-list change

Drive the flow and check where the browser actually lands:

```
https://PROJECT_REF.supabase.co/auth/v1/authorize?provider=google&redirect_to=ENCODED_CALLBACK
```

If the final host is the Site URL rather than the host requested, the entry is
not matching. The `redirect_to` echoed in the redirect to Google is **not** a
validation signal: it is echoed back verbatim even for values that are not
allow-listed, because the allow-list is applied only on the final hop back
from Supabase. Always assert on the final landing host.

The live configuration can be read with the Management API using
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF`, via
`GET /v1/projects/PROJECT_REF/config/auth` on `api.supabase.com`, reading the
`uri_allow_list` and `site_url` fields.

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

| File                        | Contents                                               |
| --------------------------- | ------------------------------------------------------ |
| `001_schema.sql`            | Core tables: `words`, `word_accuracy`, `practice_logs` |
| `002_practice_sessions.sql` | `practice_sessions` table                              |

Seed data (`supabase/seed.sql`) inserts 32 Thai practice words across 7 viseme groups.

Apply migrations and seed data via the Supabase CLI:

```bash
npx supabase db push
npx supabase db seed
```

See [GETTING-STARTED.md](GETTING-STARTED.md) for step-by-step database setup instructions.
