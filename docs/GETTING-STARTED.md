<!-- generated-by: gsd-doc-writer -->

# Getting Started

Follow these steps to get ViSpeech running locally for development or evaluation.

## Prerequisites

- **Node.js >= 18** — Next.js 16 requires Node.js 18 or later. Check your version with `node --version`.
- **npm** — Comes with Node.js. Verify with `npm --version`.
- **A Supabase project (free tier)** — ViSpeech uses Supabase for authentication, database storage, and Row Level Security. Create one at [supabase.com](https://supabase.com) if you do not already have one.

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd vispeech
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

## Environment Setup

1. **Create `.env.local`** by copying the example file:

   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** with your Supabase project credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Find these values in the Supabase Dashboard → **Project Settings → API**.

3. **(Optional for E2E testing)** Set the test user credentials:

   ```env
   E2E_TEST_EMAIL=your-test-user@example.com
   E2E_TEST_PASSWORD=your-test-password
   ```

   The corresponding user must exist in your Supabase Auth instance.

## Database Setup

Link the Supabase CLI to your project once, then apply every migration:

```bash
# The project ref is the subdomain of your Supabase project URL.
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

This applies, in order: `001_schema.sql` (creates `words`, `practice_logs`, `word_accuracy`), `002_practice_sessions.sql` (creates `practice_sessions`), `003_session_results.sql` (adds `session_id` to logs, adds `phonetic` to words), `004_lesson_words.sql` (seeds 40 vowel + conversation words), and `005_seed_demo_words.sql` (seeds the 32 original demo words). All five apply Row Level Security and all are idempotent — re-running any of them is safe.

If `db push` reports "remote migration versions not found in local migrations directory", the remote database has history entries with no matching local file, which happens when migrations were previously pasted into the dashboard by hand. The CLI prints the exact `supabase migration repair` commands needed; run those, then re-run `db push`.

You can also paste each file into the Supabase **SQL Editor** in order if you prefer not to use the CLI.

The app needs these rows — without words in the `words` table, the home page shows no lessons and practice cannot start.

## First Run

Start the Next.js development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to `/auth` for login or signup. After authenticating, the dashboard shows available practice words.

### Key Pages

| Route               | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `/auth`             | Login / signup page                                                     |
| `/dashboard`        | Practice dashboard with per-word accuracy and history                   |
| `/practice/session` | Structured session — cycles through random words with up to 12 attempts |

## Common Setup Issues

### Supabase environment variables not set

The app checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at runtime. If either is missing or empty, the app skips authentication and database operations. You will be redirected to `/auth` with a notice. Ensure both variables are set in `.env.local`.

### Camera or microphone permissions

ViSpeech requires webcam access for face tracking (MediaPipe Face Mesh) and microphone access for speech recognition (Web Speech API). If either is unavailable, the app runs in **demo mode** with simulated mouth openness and placeholder transcripts — you can still navigate the full practice flow without hardware.

### Port conflict

The Next.js dev server uses port 3000 by default. If port 3000 is already in use, run:

```bash
pnpm dev -p 3001
```

Then open [http://localhost:3001](http://localhost:3001).

## Next Steps

- See [ARCHITECTURE.md](./ARCHITECTURE.md) for an overview of the system design and component relationships.
- See [DEVELOPMENT.md](./DEVELOPMENT.md) for build commands, linting, and coding conventions.
- See [TESTING.md](./TESTING.md) for how to run unit and E2E tests.
- See [CONFIGURATION.md](./CONFIGURATION.md) for the full environment variable reference.
