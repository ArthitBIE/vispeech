<!-- generated-by: gsd-doc-writer -->
# vispeech — ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด

ViSpeech is a web application for Thai pronunciation training. It uses your webcam to track facial landmarks via **MediaPipe Face Mesh**, estimates mouth openness (viseme), and combines it with **Web Speech API** speech recognition to score pronunciation accuracy.

## Features

- **Real-time face tracking** — MediaPipe `face_mesh` tracks 468 facial landmarks and estimates mouth openness percentage
- **Thai speech recognition** — Uses the Web Speech API with `th-TH` locale; includes a demo fallback when the browser does not support it
- **Dual scoring** — Combines visual (mouth shape) and audio (transcript match) scores into a weighted total
- **Practice modes** — Practice individual words or run structured sessions with progress tracking
- **Progress dashboard** — View accuracy per word, practice history, and session summaries
- **Supabase backend** — Email/password authentication, practice logs, word accuracy aggregation, and session storage

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, IBM Plex Sans Thai |
| Face Tracking | MediaPipe Face Mesh + Camera Utils |
| Speech | Web Speech API (`SpeechRecognition`) |
| Auth & Database | Supabase (PostgreSQL, Row Level Security) |
| Testing | Vitest (unit), Playwright (E2E) |
| Runtime | Node.js >= 18 |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd vispeech

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase project credentials
```

## Quick Start

1. **Configure Supabase** — Create a project on [supabase.com](https://supabase.com), run the migrations in `supabase/migrations/`, and seed the practice words with `supabase/seed.sql`.

2. **Set environment variables** — Add your Supabase URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), sign up, and start practicing.

## Usage

### Practice an individual word

Navigate to `/practice/<word>` (or click "ฝึก" on any word in the dashboard):

1. Click **เริ่มกล้อง** to activate your webcam — mouth openness is tracked in real time.
2. Click **เริ่มพูด** to start Thai speech recognition. Speak the displayed word.
3. Click **หยุดฟัง** when done, then **ส่งผล** to submit.
4. Review your visual score, audio score, and total score with Thai-language feedback.

### Run a practice session

Navigate to `/practice/session` (click **เริ่มฝึก** on the dashboard):

- The system picks 3 random words and cycles through them.
- You get up to 12 attempts. Passing a word (score >= 70) replaces it with a new word.
- At the end, a summary shows total attempts, words passed, and best score.
- Session data is saved to Supabase and appears in the dashboard history.

### Demo fallback mode

If your browser does not support the Web Speech API or MediaPipe fails to load (e.g., over HTTP), the app falls back to demo mode — mouth openness is simulated with random values and a placeholder transcript is returned. This lets you explore the UI without a camera or supported speech engine.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── practice-sessions/route.ts   — POST: save session summary
│   │   ├── score/route.ts               — POST: submit practice attempt
│   │   └── words/route.ts               — GET: list words (filterable)
│   ├── auth/page.tsx                     — Login / signup page
│   ├── dashboard/page.tsx               — Practice dashboard with stats
│   ├── practice/
│   │   ├── [word]/page.tsx              — Individual word practice
│   │   └── session/page.tsx            — Structured practice session
│   ├── layout.tsx                       — Root layout (IBM Plex Sans Thai)
│   └── page.tsx                         — Landing / session redirect
├── lib/
│   ├── mediapipe/index.ts               — Face Mesh initialization & tracking
│   ├── scoring/index.ts                 — Deterministic heuristic scoring
│   ├── supabase/client.ts               — Supabase browser client
│   ├── supabase/server.ts               — Supabase server client
│   └── viseme/index.ts                  — Speech recognizer with fallback
├── middleware.ts                        — Route protection
└── types/
    ├── global.d.ts                      — Web Speech API type declarations
    └── mediapipe.d.ts                   — MediaPipe type declarations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (unit + E2E) |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## Database

The Supabase schema includes four tables:

| Table | Purpose |
|-------|---------|
| `words` | Thai practice words with viseme group and difficulty |
| `practice_logs` | Per-attempt scores linked to user and word |
| `word_accuracy` | Aggregated accuracy stats per user per word |
| `practice_sessions` | Session-level summaries (attempts, passes, best score) |

Row Level Security is enabled — users can only read/write their own practice data. All authenticated users can read the `words` table.

## License

This project is private and not licensed for public distribution.
