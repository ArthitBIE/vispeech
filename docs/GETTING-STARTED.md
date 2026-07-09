# Getting Started

## Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier)

## Installation

```bash
git clone <repo-url>
cd vispeech
npm install
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**
3. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

4. Open Supabase **SQL Editor** and run `supabase/migrations/001_schema.sql` — this creates the `words`, `practice_logs`, and `word_accuracy` tables with RLS policies
5. Run `supabase/seed.sql` to insert 30 Thai practice words with difficulty tiers

## Run the Dev Server

```bash
npm run dev
```

Open http://localhost:3000

The app redirects to `/auth` for login/signup. After authentication, the
dashboard shows available practice words.

## Verify It Works

1. Register a new account (email + password)
2. Select a word from the dashboard
3. Grant camera and microphone permissions when prompted
4. Speak the word and see your score + Thai feedback

If camera or microphone are unavailable, the app runs in demo mode with
simulated data — you can still test the full practice flow without hardware.