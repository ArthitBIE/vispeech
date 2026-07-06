# vispeech — ฝึกออกเสียงภาษาไทย

Thai speech training web app for hearing-impaired individuals.
Built with Next.js + TypeScript + Supabase + MediaPipe Face Mesh.

## Requirements

- Node.js 18+
- npm
- Supabase project (free tier)

## Setup

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database

Run migrations in your Supabase SQL editor:
1. `supabase/migrations/001_schema.sql` — creates tables and RLS policies
2. `supabase/seed.sql` — inserts 30 Thai practice words

### Run

```bash
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js App Router (TypeScript)
- Supabase (Auth + PostgreSQL with RLS)
- MediaPipe Face Mesh (browser-based facial landmark detection)
- Web Speech API (browser speech recognition, th-TH)
- Tailwind CSS

## Notes

- **Scoring is heuristic/demo only** — not clinically validated
- **Thai language only** — UI and speech recognition target Thai
- **Browser support**: Chrome recommended for best speech recognition support
- **Camera fallback**: If MediaPipe is unavailable, the app runs in demo mode

## Project Structure

```
src/
├── app/
│   ├── auth/page.tsx          # Login/signup (Thai)
│   ├── dashboard/page.tsx     # Word list + accuracy + history
│   ├── practice/[word]/       # Practice page
│   └── api/score/route.ts     # Scoring API
├── lib/
│   ├── supabase/              # Supabase client utilities
│   ├── mediapipe/             # Face Mesh abstraction + fallback
│   └── viseme/                # Speech recognition abstraction + fallback
├── middleware.ts              # Route protection
```

## License

Private — internal use
