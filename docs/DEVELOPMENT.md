# Development

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm test` | Run all tests |

## Project Structure

```
src/
├── app/                 Next.js App Router pages + API routes
│   ├── api/score       POST scoring endpoint
│   ├── api/words       GET word list endpoint
│   ├── auth             Login/signup page
│   ├── dashboard        Practice overview
│   ├── home             Landing page
│   └── practice/        Practice flow ([word], session)
├── lib/
│   ├── mediapipe/       Face Mesh wrapper + fallback
│   ├── scoring/          Heuristic scoring engine
│   ├── supabase/         Supabase client helpers
│   └── viseme/           Speech recognition wrapper + fallback
├── types/               TypeScript declarations
└── middleware.ts         Route protection
supabase/
├── migrations/          Database schema
└── seed.sql             Initial word data
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow and module roles.

## Adding a New Word

1. Insert a row into the `words` table with a Thai word, viseme group, and difficulty level
2. The dashboard and practice pages pick it up automatically

## Adding a New Page

1. Create a route file under `src/app/`
2. Add the route to the middleware allowlist if it should be public
3. Use the `data-testid` attribute convention for Playwright selectors

## Code Conventions

- TypeScript strict mode
- "use client" directive for interactive pages
- Tailwind CSS for styling
- Thai language for all user-facing strings
- `data-testid` attributes on interactive elements for E2E testing