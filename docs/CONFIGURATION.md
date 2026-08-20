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

### Current allow-list entries

This is the full contents of `uri_allow_list` as read from the live project.
It is recorded here because the allow-list lives only in Supabase project
config: it is not in this repo, is not covered by any migration, and would not
survive recreating the project from scratch.

```
https://vispeech-pi.vercel.app/auth/callback
https://vispeech-pi.vercel.app
http://localhost:3000/auth/callback
https://vispeech-git-develop-arthitbies-projects.vercel.app/auth/callback
```

Site URL is `https://vispeech-pi.vercel.app/auth/callback`.

This is the fallback destination: where a user lands whenever the requested
`redirect_to` is **not** allow-listed.

Only the host is load-bearing for the checks in `scripts/`. Two values must
agree with the host recorded here, and both fail loudly if they drift:

- `SITE_URL_HOST` in `scripts/check-redirect-behaviour.mjs`, which asserts
  that denied cases land on the Site URL rather than merely failing to be
  honoured.
- The `Site URL is` line above, which `scripts/check-redirect-allowlist.mjs`
  parses and compares against the live project.

A mismatch between these is **not** a security finding on its own. It means
the fallback moved, not that a denied host was accepted. The allow-list is
what governs acceptance, and it is checked separately.

The first entry is the production URL. The second is for local dev. The third
covers the develop branch preview deployment. For other long-lived branches,
add one entry per branch using the stable per-branch alias.

### Vercel preview deployments

Per-build preview URLs contain a build hash, so they cannot be listed ahead of
time, and they are **not** allow-listed. This is deliberate: the wildcards that
used to cover them were a session-handoff vector (see below).

OAuth on a preview does not need the per-build URL. Vercel also publishes a
stable per-branch alias:

```
https://vispeech-git-<branch>-arthitbies-projects.vercel.app
```

That alias is what belongs in the allow-list, one exact entry per branch that
needs to exercise sign-in, as already present for `develop`. Testing OAuth on a
new long-lived branch therefore costs one line, not one line per build.

Note the Vercel team slug is `arthitbies-projects`. A URL built with the wrong
slug is simply not allow-listed and silently falls back to the Site URL.

### Never add a bare `https://*.vercel.app` entry

Such an entry allow-lists **every** site on `vercel.app`, including ones owned
by other people. Because Supabase returns the session in the URL fragment,
anyone who can deploy any project to `vercel.app` can send a victim a link to
the authorize endpoint with their own domain as `redirect_to` and receive that
user's `access_token`, `refresh_token`, and Google `provider_token`. That is a
full account takeover needing no interaction beyond clicking a link.

This entry was present on the project and has been removed.

### Never use a wildcard in the host at all

The project also carried two team-anchored preview wildcards, which looked far
safer than the bare one:

```
https://vispeech-*-arthitbies-projects.vercel.app
https://vispeech-*-arthitbies-projects.vercel.app/**
```

They were removed too, because the anchoring does not do what it appears to.

The intuition that saves them is that `*` cannot cross a dot, so the pattern
can only match hosts inside this team's namespace. The first half is true and
was verified. The second half does not follow, and this was the error: the
team slug is not a DNS label here. `vercel.app` project hosts are a single
**flat, global, first-come** namespace, and a project's name is free text
chosen by whoever creates the project. Nothing stops an outsider from naming a
project `vispeech-login-arthitbies-projects`, which yields exactly
`vispeech-login-arthitbies-projects.vercel.app`, one label, no dot crossed, a
clean match. Owning the team slug as a _substring_ confers no control.

This was confirmed against the live project rather than reasoned about. Three
unclaimed hosts of that shape were both honored by Supabase as redirect targets
and returned 404, meaning the names were free for anyone to register. The
consequence is identical to the bare wildcard: register the name, send a link,
receive the victim's `access_token`, `refresh_token`, and Google
`provider_token` from the URL fragment.

The rule is therefore the simple one, not the nuanced one: **the host portion
of an allow-list entry must be spelled out in full.** A `/**` path wildcard on
an exact host is fine and is still in use above; a `*` anywhere in the host is
not, however well anchored it looks.

Removing these cost almost nothing, which is what made the earlier
"accepted residual risk" framing a bad trade: preview OAuth runs on the stable
per-branch alias described above, so no per-build maintenance was being bought
by keeping them.

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

Note that the default request agent string is rejected by Cloudflare with
`error code: 1010`; send a normal browser user-agent.

### Keeping this page honest

Because the allow-list is recorded here by hand, it can drift from the live
project. To compare the two:

```bash
pnpm check:auth
```

That runs two complementary checks, and both matter:

`pnpm check:allowlist` compares the live entries against the list above and
exits non-zero if they disagree, or if any entry has a wildcard in the host
position. It skips cleanly when the Supabase credentials are absent, so it is
safe to run without project access.

`pnpm check:redirects` goes further and probes what Supabase actually _does_
with those entries, asserting that every legitimate sign-in host is honoured
and every attacker-shaped host falls back to the Site URL. String comparison
alone would not have caught either real defect found on this project: the
localhost entry that was present but not honoured, or the preview wildcard
whose match semantics were wider than they read. It needs no credentials, only
`NEXT_PUBLIC_SUPABASE_URL`.

The behaviour probe takes about 15 seconds because the verify endpoint rate
limits after roughly two rapid requests, so it paces itself. If it does get
rate limited it reports `INCONCLUSIVE` and exits non-zero rather than scoring
the unanswered cases: a 429 has no `Location` header, and reading that absence
as "the host was refused" would mark every deny case as passing while testing
nothing at all.

### What actually runs these checks

Neither check is useful if it only runs when someone remembers it, and the
allow-list is edited in the Supabase dashboard, so the change that breaks it
never appears in a commit. There are two layers, deliberately different:

| Layer                               | Trigger          | Catches                                                                         |
| ----------------------------------- | ---------------- | ------------------------------------------------------------------------------- |
| `.husky/pre-push`                   | every `git push` | a stale docs table or a reintroduced host wildcard, at the moment you caused it |
| `.github/workflows/auth-config.yml` | daily 07:00 UTC  | dashboard-side drift by someone who never pushed                                |

The hook is only a safety net. Both scripts exit 0 when they cannot run -- no
credentials, no network -- so a push is never blocked for a reason unrelated to
the change being pushed. The consequence is that the hook cannot be relied on
alone, which is why the scheduled workflow exists.

The workflow sets `STRICT=1`, which turns those same skips into failures. A
scheduled job whose secrets were never configured would otherwise report green
forever while checking nothing, which is the specific failure mode this whole
section exists to prevent. It needs `SUPABASE_ACCESS_TOKEN` and
`SUPABASE_PROJECT_REF` as repository secrets, and `NEXT_PUBLIC_SUPABASE_URL`
as a repository variable; until those are set the daily run fails loudly
rather than passing quietly.

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

Uses `eslint-config-next` with Flat Config format (ESLint v9). Run with `pnpm lint`.

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
- Run with: `pnpm test:unit`

### `playwright.config.ts`

**Location:** `/playwright.config.ts`

E2E test configuration:

- **Test directory:** `./e2e`
- **Base URL:** `http://localhost:3000`
- **Projects:** `setup`, `unauthenticated`, `authenticated`
- **Web server:** auto-starts `pnpm dev`; reuses existing server locally
- Run with: `pnpm test:e2e`

## Per-Environment Overrides

ViSpeech does not use dedicated `.env.development`, `.env.production`, or `.env.test` files. All environment variables are loaded from `.env.local` regardless of the runtime environment.

The `NODE_ENV` variable is managed internally by Next.js and does not need to be set manually.

The only environment-aware behavior is the `CI` variable, which adjusts Playwright's retry/worker settings when running in CI pipelines.

## Supabase Database Configuration

Database schema and seed data are defined in migration files under `supabase/migrations/`:

| File                        | Contents                                                     |
| --------------------------- | ------------------------------------------------------------ |
| `001_schema.sql`            | Core tables: `words`, `word_accuracy`, `practice_logs` + RLS |
| `002_practice_sessions.sql` | `practice_sessions` table + RLS                              |
| `003_session_results.sql`   | `session_id` on logs, `phonetic` on words + RLS              |
| `004_lesson_words.sql`      | Vowels + conversation words (40 rows, idempotent)            |
| `005_seed_demo_words.sql`   | Original demo words (32 rows, idempotent)                    |

All migrations are idempotent — re-running any of them is safe. Run them in order via the Supabase SQL editor or CLI:

```bash
npx supabase db push
```

See [GETTING-STARTED.md](GETTING-STARTED.md) for step-by-step database setup instructions.
