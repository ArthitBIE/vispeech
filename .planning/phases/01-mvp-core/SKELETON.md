# Walking Skeleton: vispeech Phase 1

## What This Skeleton Proves

A user can:
1. Visit the app and see a Thai-language landing page
2. Sign up or log in with email/password via Supabase Auth
3. See a dashboard with a list of Thai practice words (read from Supabase)
4. Click a word and enter a practice page
5. See camera preview (or fallback) and microphone (or fallback)
6. Submit a practice attempt
7. Receive visual + audio + total scores with Thai feedback
8. See their accuracy data update on the dashboard

## Thinnest End-to-End Slice

```
Browser ──▶ Next.js App ──▶ Supabase
  │              │              │
  │  /auth       │   auth       │  Auth API
  │  /dashboard  │── queries ──▶│  words, accuracy, logs
  │  /practice   │   scores     │
  │              │─────────────▶│  INSERT practice_logs
  │              │              │  UPSERT word_accuracy
  │  /api/score  │   heuristic  │
  └──────────────┘              └──────────────
```

## Files the Skeleton Creates

```
src/
├── app/
│   ├── layout.tsx          (Thai metadata, fonts)
│   ├── page.tsx            (Root redirect)
│   ├── auth/page.tsx       (Login/signup)
│   ├── dashboard/page.tsx  (Word list, accuracy, history)
│   ├── practice/
│   │   └── [word]/page.tsx (Practice flow)
│   └── api/
│       └── score/route.ts  (Scoring endpoint)
├── lib/
│   ├── supabase/
│   │   ├── client.ts       (Browser Supabase client)
│   │   └── server.ts       (Server Supabase client factory)
│   ├── mediapipe/
│   │   └── index.ts        (Face Mesh abstraction + fallback)
│   └── viseme/
│       └── index.ts        (Web Speech abstraction + fallback)
├── middleware.ts            (Route protection)
supabase/
├── migrations/
│   └── 001_schema.sql      (Tables, RLS, policies)
└── seed.sql                 (30 Thai words)
```

## Dev Deployment

```bash
npm run dev          # Local dev server
npm run build        # Verify production build
```
