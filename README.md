<!-- generated-by: gsd-doc-writer -->

# vispeech — ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด

ViSpeech is a web application for Thai pronunciation training. It uses your webcam to track facial landmarks via **MediaPipe Face Mesh**, estimates mouth openness (viseme), and combines it with Thai speech recognition plus **edge TTS** audio playback to score pronunciation accuracy.

## Features

- **Real-time face tracking** — MediaPipe `face_mesh` tracks 468 facial landmarks and estimates mouth openness percentage
- **Thai speech recognition** — Uses the Web Speech API with `th-TH` locale; includes a demo fallback when the browser does not support it
- **Text-to-speech** — Edge TTS (`edge-tts-universal`) reads words aloud via a server route, with an audible play button and progress meter
- **Lip-shape examples** — Each word shows a matching lip-shape illustration (viseme group) as a pronunciation reference
- **Dual scoring** — Combines visual (mouth shape) and audio (transcript match) scores into a weighted total
- **Lesson-based practice** — Structured practice sessions (`/practice/session`) built from lesson groups (คำศัพท์, เสียงสระ, บทสนทนา) with difficulty levels
- **Summary page** — End-of-session review with per-word scores, accuracy, and star rating
- **Progress dashboard** — View accuracy per word, practice history, session summaries, and daily streaks
- **Supabase backend** — Email/password + Google OAuth authentication, practice logs, word accuracy aggregation, and session storage

## Tech Stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19                       |
| Styling         | Tailwind CSS 4, IBM Plex Sans Thai, shadcn/ui           |
| Face Tracking   | MediaPipe Face Mesh + Camera Utils                      |
| Speech          | Web Speech API (`SpeechRecognition`)                    |
| Text-to-Speech  | `edge-tts-universal` via `/api/tts`                     |
| Auth & Database | Supabase (PostgreSQL, Row Level Security, Google OAuth) |
| Observability   | Vercel Analytics + Speed Insights                       |
| Testing         | Vitest (unit), Playwright (E2E)                         |
| Package manager | pnpm (>= 11)                                            |
| Runtime         | Node.js >= 20.9 (Next.js 16 requirement)                |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd vispeech

# Install dependencies (pnpm — see packageManager field)
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase project credentials
```

## Quick Start

1. **Configure Supabase** — Create a project on [supabase.com](https://supabase.com). In the Supabase SQL editor, run the migration files **in order**: `supabase/migrations/001_schema.sql` → `002_practice_sessions.sql` → `003_session_results.sql` → `004_lesson_words.sql` → `005_seed_demo_words.sql`. All five are idempotent and apply Row Level Security. The app needs these rows — without words in the `words` table, the home page shows no lessons and practice cannot start.

2. **Set environment variables** — Add your Supabase URL and anon key to `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server**:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), sign up, and start practicing.

> For production deploys, set the Supabase **Site URL** to your production domain and add it to the **Redirect URLs** allowlist (Authentication → URL Configuration) — otherwise OAuth redirects fall back to `localhost`.

## Usage

### Sign in

Navigate to `/auth/signin` (or `/auth/signup`): email/password or **Login with Google**. OAuth completes through `/auth/callback`, then redirects to the dashboard.

### Run a practice session

Navigate to `/practice/session?group=<lesson>` (click a lesson card on the home/dashboard):

1. The lesson panel lists the words for the active lesson and difficulty level.
2. Click **เริ่มกล้อง** to activate your webcam — mouth openness is tracked in real time; a demo fallback kicks in if no face is detected.
3. Click the audio button (or **ฟังเสียง**) to hear the word via edge TTS.
4. Speak the word; scoring combines mouth shape and transcript match.
5. Complete all words to land on `/summary` — per-word scores, accuracy, and star rating.

### Demo fallback mode

If your browser does not support the Web Speech API or MediaPipe fails to load (e.g., over HTTP), the app falls back to demo mode — mouth openness is simulated with random values and a placeholder transcript is returned. This lets you explore the UI without a camera or supported speech engine.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── practice-sessions/route.ts   — GET/POST/PATCH session summaries
│   │   ├── score/route.ts               — POST: submit practice attempt
│   │   ├── tts/route.ts                 — GET: edge TTS audio stream
│   │   └── words/route.ts               — GET: list words (filterable)
│   ├── (app)/                           — Authenticated app shell
│   │   ├── dashboard/page.tsx           — Progress dashboard
│   │   ├── home/page.tsx                — Lesson list with search
│   │   └── settings/page.tsx            — Mic/settings page
│   ├── auth/
│   │   ├── callback/page.tsx            — OAuth redirect handler
│   │   ├── signin/page.tsx              — Login (email + Google)
│   │   └── signup/page.tsx              — Sign up
│   ├── practice/
│   │   └── session/page.tsx             — Lesson-based practice session
│   ├── summary/page.tsx                 — Session results review
│   ├── layout.tsx                       — Root layout (IBM Plex Sans Thai)
│   └── page.tsx                         — Landing / redirect
├── components/
│   ├── practice/                        — PracticeWord, LipExample, PracticeResultSidebar
│   └── layout/                          — AppShell, Header, Sidebar
├── lib/
│   ├── lesson.ts                        — Lesson definitions (คำศัพท์/เสียงสระ/บทสนทนา)
│   ├── tts.ts                           — Edge TTS client helpers
│   ├── viseme/index.ts                  — Speech recognizer + lip-shape mapping
│   ├── mediapipe/index.ts               — Face Mesh initialization & tracking
│   ├── supabase/client.ts               — Supabase browser client
│   └── streak.ts                        — Daily streak computation
├── proxy.ts                             — Request proxy (Next 16; was middleware.ts)
└── types/                               — Web Speech API + MediaPipe declarations
```

## Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `pnpm dev`              | Start Next.js development server     |
| `pnpm build`            | Production build                     |
| `pnpm start`            | Start production server              |
| `pnpm lint`             | Run ESLint                           |
| `pnpm test`             | Run all tests (unit + E2E)           |
| `pnpm test:unit`        | Run Vitest unit tests                |
| `pnpm test:e2e`         | Run Playwright E2E tests             |
| `pnpm create-test-user` | Create the E2E test user in Supabase |

A husky pre-commit hook runs lint-staged (Prettier) plus the full test suite (`vitest run && playwright test`).

## Database

The Supabase schema includes four tables:

| Table               | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `words`             | Thai practice words with viseme group and difficulty   |
| `practice_logs`     | Per-attempt scores linked to user and word             |
| `word_accuracy`     | Aggregated accuracy stats per user per word            |
| `practice_sessions` | Session-level summaries (attempts, passes, best score) |

Row Level Security is enabled — users can only read/write their own practice data. All authenticated users can read the `words` table. Full schema and seed data in `supabase/migrations/`.

## Documentation

- `docs/GETTING-STARTED.md` — Environment and setup walkthrough
- `docs/ARCHITECTURE.md` — System design and data flow
- `docs/API.md` — API route reference
- `docs/DEVELOPMENT.md` — Development workflow, conventions, migrations
- `docs/TESTING.md` — Test setup and guidelines
- `docs/CONFIGURATION.md` — Supabase and runtime configuration

## Credits

| Role      | Name                                   |
| --------- | -------------------------------------- |
| Designer  | [Waisoka](https://github.com/Waisoka)  |
| Developer | [Atiyut](https://github.com/ArthitBIE) |

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
