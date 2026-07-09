# Configuration

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

The app will run without these variables but API endpoints will return 500 errors.

## Next.js Config

`next.config.ts` — standard Next.js config. No special image hosts, rewrites,
or webpack overrides required.

## TypeScript

TypeScript config is in `tsconfig.json` with standard Next.js settings.
Path alias `@/*` maps to `src/*`.

## ESLint

ESLint config in `eslint.config.mjs` using `eslint-config-next`.
Run: `npm run lint`

## Vitest

Unit tests use Vitest with `@vitejs/plugin-react`. Config in `vitest.config.ts`.
Run: `npm run test:unit`

## Playwright

E2E tests use Playwright with config in `playwright.config.ts`.
Run: `npm run test:e2e`

## Supabase Setup

See [GETTING-STARTED.md](GETTING-STARTED.md) for database migration and seed
instructions.

## Demo Mode

If `NEXT_PUBLIC_SUPABASE_URL` is set to `https://placeholder.supabase.co`,
the app enters demo mode — API endpoints skip Supabase writes and return
mock data. Camera/MediaPipe still attempts initialization; if either
Web Speech API or MediaPipe is unavailable, the app transparently falls
back to demo recognizers.