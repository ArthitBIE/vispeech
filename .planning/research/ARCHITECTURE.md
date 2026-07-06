# Architecture Research: vispeech

## Component Map

```
Browser                          Next.js Server          Supabase
┌─────────────────────┐          ┌──────────────┐        ┌───────────┐
│ Auth Page (/auth)    │          │ Middleware    │        │ Auth      │
│ Dashboard (/dash)    │─────────▶│ API Routes   │────────▶│ Database  │
│ Practice (/practice) │          │ Server Comps  │        │ RLS       │
│  ┌─ MediaPipe WASM   │          └──────────────┘        └───────────┘
│  └─ Web Speech API   │
└─────────────────────┘
```

## Data Flow

1. **Auth flow**: User signs up/logs in → Supabase Auth → session cookie set by middleware → protected routes check session
2. **Dashboard flow**: Server component fetches words + accuracy + practice_logs from Supabase → renders Thai UI
3. **Practice flow**: Client component loads word → initializes MediaPipe (camera) + Web Speech API (mic) → user practices → scores computed client-side → sent to /api/score → saved to Supabase
4. **Scoring flow**: Submit → /api/score (heuristic) → returns scores → saved to practice_logs → word_accuracy upserted

## Build Order

1. (Foundation) Next.js init + Supabase client libs
2. (Data) Schema + RLS + seed data
3. (Auth) Login/signup page + middleware
4. (Dashboard) Word list + accuracy display
5. (Abstractions) MediaPipe + Web Speech wrappers
6. (Practice) Practice page
7. (API) Scoring route
8. (Polish) Build verification + final Touches
