# vispeech — ฝึกออกเสียงภาษาไทย

Thai speech training web app designed for hearing-impaired individuals. Uses
browser-based face landmark detection and speech recognition to provide real-time
pronunciation feedback.

Built with **Next.js 16**, **TypeScript**, **Supabase**, and **MediaPipe Face Mesh**.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000

See [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md) for full setup including
Supabase configuration and database migration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth & DB | Supabase (PostgreSQL + RLS) |
| Face tracking | MediaPipe Face Mesh (browser) |
| Speech | Web Speech API (th-TH) |
| Styling | Tailwind CSS |
| Testing | Vitest (unit) + Playwright (E2E) |

## Project Structure

```
src/
├── app/
│   ├── auth/              Login / signup
│   ├── dashboard/         Word list, accuracy, history
│   ├── home/              Landing
│   ├── practice/          Pronunciation practice flow
│   └── api/
│       ├── score/         Scoring endpoint
│       └── words/         Word list endpoint
├── lib/
│   ├── supabase/          Supabase client (server + browser)
│   ├── mediapipe/         Face Mesh wrapper with fallback
│   ├── scoring/           Heuristic pronunciation scoring
│   └── viseme/            Speech recognition abstraction
└── middleware.ts          Auth route protection
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Getting Started](docs/GETTING-STARTED.md)
- [Development](docs/DEVELOPMENT.md)
- [Testing](docs/TESTING.md)
- [Configuration](docs/CONFIGURATION.md)

## License

Private — internal use.