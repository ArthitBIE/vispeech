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

### Supabase setup

1. Go to [Supabase dashboard](https://supabase.com) and create a project.
2. In **Project Settings → API**, find your **Project URL** and **anon public key**.
3. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. Restart the dev server after editing `.env.local`.
5. Open Supabase **SQL Editor** and run `supabase/migrations/001_schema.sql` to create tables and RLS policies.
6. Then run `supabase/seed.sql` to insert 30 Thai practice words.

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
│   ├── home/page.tsx          # Redirect to /
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
