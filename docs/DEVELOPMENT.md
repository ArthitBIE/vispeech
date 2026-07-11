<!-- generated-by: gsd-doc-writer -->
# Development

## Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd vispeech

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `E2E_TEST_EMAIL` | For E2E | Email of a test user for Playwright authentication |
| `E2E_TEST_PASSWORD` | For E2E | Password of the test user |
| `SUPABASE_SERVICE_ROLE_KEY` | For scripts | Service role key (for `create-test-user.ts`) |

**Supabase setup:** Create a project on [supabase.com](https://supabase.com), then run the migrations and seed data:

```bash
# Apply migrations in order
npx supabase db push
# Or run them manually via the Supabase SQL editor:
#   supabase/migrations/001_schema.sql
#   supabase/migrations/002_practice_sessions.sql
# Then seed practice words:
#   supabase/seed.sql
```

**Create a test user (for E2E):**

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npm run create-test-user
```

## Build Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server on `http://localhost:3000` |
| `npm run build` | Production build (compiles and optimizes for deployment) |
| `npm start` | Start the production server (requires `build` first) |
| `npm run lint` | Run ESLint across the codebase |
| `npm run test:unit` | Run Vitest unit tests (co-located in `__tests__` directories) |
| `npm run test:e2e` | Run Playwright E2E tests (in `e2e/`) |
| `npm test` | Run all tests (unit + E2E) |

**Type checking:** The project uses TypeScript `strict` mode. Run type checks with:

```bash
npx tsc --noEmit
```

This is not set as an npm script by default — add it to `scripts` in `package.json` if used frequently.

## Project Structure

```
src/
├── app/                    Next.js App Router — pages and API routes
│   ├── api/
│   │   ├── practice-sessions/route.ts   POST: save session summary
│   │   ├── score/route.ts               POST: submit practice attempt
│   │   └── words/route.ts               GET: list words (filterable)
│   ├── auth/page.tsx                     Login / sign-up page
│   ├── dashboard/page.tsx               Practice dashboard with stats
│   ├── home/page.tsx                     Landing page content
│   ├── practice/
│   │   ├── [word]/page.tsx              Single-word practice (camera + mic + scoring)
│   │   └── session/page.tsx            Multi-word session with adaptive rotation
│   ├── globals.css                      Tailwind CSS entry point
│   ├── layout.tsx                       Root layout (IBM Plex Sans Thai font)
│   └── page.tsx                         Session check → redirect to /auth or /dashboard
├── lib/                    Framework-agnostic business logic
│   ├── mediapipe/index.ts              MediaPipe Face Mesh wrapper + demo fallback
│   ├── scoring/index.ts                Deterministic heuristic scoring engine
│   ├── supabase/
│   │   ├── client.ts                   Supabase browser client
│   │   └── server.ts                   Supabase server client (no session persistence)
│   └── viseme/
│       ├── index.ts                    Web Speech API wrapper + demo fallback
│       └── __tests__/fallback.test.ts  Unit tests for speech recognizer
├── middleware.ts           Next.js middleware — route allowlist matching
└── types/
    ├── global.d.ts                     Web Speech API type declarations (SpeechRecognition)
    └── mediapipe.d.ts                  MediaPipe module declarations (face_mesh, camera_utils)

supabase/
├── migrations/            Versioned SQL migrations (applied in order)
│   ├── 001_schema.sql     Core tables: words, practice_logs, word_accuracy
│   └── 002_practice_sessions.sql   Session table and RLS policies
└── seed.sql               30 Thai practice words in 7 viseme groups

e2e/                        Playwright E2E tests
├── global.setup.ts         Auth setup (logs in via /auth, saves storage state)
├── auth.spec.ts            Authentication flow tests
├── dashboard.spec.ts       Dashboard page tests
└── practice.spec.ts        Practice flow tests

scripts/
└── create-test-user.ts     Creates a test user via Supabase Admin API
```

## Code Style and Conventions

### TypeScript

- **Strict mode** is enabled in `tsconfig.json` (`"strict": true`) — no implicit `any`, strict null checks, etc.
- Use the `@/` path alias for imports from `src/` (e.g., `import { supabase } from "@/lib/supabase/client"`).
- Module declarations for browser APIs and third-party packages live in `src/types/*.d.ts`.
- All user-facing strings are in Thai.

### Components and Pages

- Pages that use browser APIs (camera, microphone, router) use the `"use client"` directive.
- Server components (layouts, static pages) omit the directive.
- Interactive elements include a `data-testid` attribute for Playwright selector targets:
  - `login-email`, `login-password`, `login-submit` — auth form
  - `practice-camera-btn`, `practice-speech-btn`, `practice-submit` — practice controls
  - `practice-mouth-open`, `practice-transcript` — live data displays
  - `score-card`, `try-again` — results
  - `dashboard-word-card` — word list rows

### Styling

- **Tailwind CSS 4** via `@tailwindcss/postcss` — utility classes only, no custom CSS modules.
- Global reset and base styles in `src/app/globals.css`.
- Font: **IBM Plex Sans Thai** (variable weight, loaded via Next.js `next/font`). Applied via CSS variable `--font-ibm-plex-sans-thai`.
- Theme color: Indigo `#6366F1` (configured in root layout viewport metadata).

### Linting

- **ESLint 9** with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Config: `eslint.config.mjs` at project root.
- Run: `npm run lint`.
- No Prettier or other formatter is configured.

### Testing

- **Unit tests**: Vitest with `jsdom` environment, co-located in `__tests__/` directories next to the module under test:
  ```bash
  npm run test:unit
  ```
- **E2E tests**: Playwright in `e2e/`, split into `unauthenticated` (auth spec) and `authenticated` (dashboard + practice specs) projects:
  ```bash
  npm run test:e2e
  ```
- E2E tests require a running dev server (Playwright's `webServer` config handles this automatically).
- E2E auth depends on `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` environment variables.

## Database Migrations

Schema changes go in `supabase/migrations/` as versioned SQL files:

1. **Create a new migration file** named sequentially (e.g., `003_feature_name.sql`).
2. Add the SQL statements inside — table creation, column additions, index creation, or new RLS policies.
3. Apply the migration via the Supabase SQL editor or the Supabase CLI:

   ```bash
   npx supabase db push
   ```

4. If the migration adds seed data, update `supabase/seed.sql` as well.
5. Update `docs/ARCHITECTURE.md` and `docs/CONFIGURATION.md` if the schema change affects documented structures or environment variables.

**Current migration order:**

| File | Adds |
|---|---|
| `001_schema.sql` | `words`, `practice_logs`, `word_accuracy` tables with RLS |
| `002_practice_sessions.sql` | `practice_sessions` table with RLS |

## Adding New Practice Word Types

The `words` table stores practice words with a `viseme_group` column that maps to visual mouth-shape categories. To add new word types:

1. **Insert rows** into the `words` table:

   ```sql
   INSERT INTO words (word, viseme_group, difficulty) VALUES
     ('ใหม่', 'ปากเปิดกลาง', 2),
     ('เก่า', 'ริมฝีปากปิด', 1);
   ```

2. **Update `supabase/seed.sql`** to keep the seed data in sync with new additions.

3. **If adding a new viseme group**, check whether the scoring engine in `src/lib/scoring/index.ts` handles it. The `DeterministicHeuristicStrategy.idealMouthOpen()` method maps specific words to ideal mouth-open values. If the group needs new scoring logic, update the `wideWords`, `roundedWords`, or `closedWords` arrays, or add a new category.

4. The dashboard and practice pages query `GET /api/words` which reads all rows from the `words` table — no code changes needed for new words to appear.

## Utility Scripts

### Create E2E Test User

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
npm run create-test-user
```

Creates a user via the Supabase Admin API with `email_confirm: true`. The email and password default to `test@vispeech.com` / `test123456` if the environment variables `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` are not set. Outputs the credentials needed for E2E tests.

## Branch Conventions

No branch naming convention is formally documented. The default branch is `main`. Contributors are advised to use descriptive names (e.g., `fix/typo-in-scoring`, `feat/new-word-group`). Pull requests should target `main`.

## Pull Request Process

No formal pull request template or checklist is configured. When submitting a PR:

1. Ensure `npm run lint` and `npm test` pass.
2. Write a concise description of the change and why it was made.
3. If the change adds or modifies UI, include `data-testid` attributes for future E2E test coverage.
4. If the change modifies the database schema, include the migration file and update seed data.
5. Request review from a project maintainer.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [GETTING-STARTED.md](GETTING-STARTED.md) for additional context.
