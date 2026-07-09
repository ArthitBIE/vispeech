# Architecture

## Overview

vispeech is a Next.js 16 App Router application serving a single-page practice
flow for Thai pronunciation training. The app uses Supabase for auth and data
storage, MediaPipe Face Mesh for browser-based lip tracking, and the Web Speech
API for speech recognition.

## Data Flow

```
┌──────────┐   ┌──────────────┐   ┌──────────────────┐
│  Camera  │──▶│ MediaPipe    │──▶│ Scoring Engine   │
│  (video) │   │ Face Mesh    │   │ (heuristic)      │
└──────────┘   └──────────────┘   └────────┬─────────┘
                                           │
┌──────────┐                               │
│  Mic     │──▶ Web Speech API ────────────┘
└──────────┘      (th-TH)
                                           │
                                   ┌───────▼─────────┐
                                   │  Supabase       │
                                   │  practice_logs  │
                                   │  word_accuracy  │
                                   └─────────────────┘
```

1. User selects a word from the dashboard
2. Camera captures video → MediaPipe Face Mesh detects lip landmarks
3. Microphone captures audio → Web Speech API returns transcript
4. Scoring engine combines visual (mouth shape) + audio (transcript match) → score + Thai feedback
5. Result saved to Supabase `practice_logs` and `word_accuracy`

## Database Schema

Three tables:

- **words** — Thai practice words with difficulty tiers
- **practice_logs** — Per-attempt scores linked to user + word
- **word_accuracy** — Aggregated per-user per-word stats (best, average, attempts)

All tables use Row-Level Security scoped to the authenticated user.

## Key Modules

| Module | Role |
|--------|------|
| `src/lib/mediapipe` | Wraps MediaPipe Face Mesh with a demo fallback |
| `src/lib/viseme` | Abstractions Web Speech API with a demo fallback |
| `src/lib/scoring` | Heuristic scoring combining audio + visual metrics |
| `src/lib/supabase` | Server and client Supabase helpers |
| `src/app/api/score` | POST endpoint for scoring + persistence |
| `src/app/api/words` | GET endpoint for word list (filtered, auth-protected) |
| `src/middleware` | Route protection via Supabase session check |

## Routing

```
/                     → redirect to /home
/home                 → landing / hero
/auth                 → login / signup
/dashboard            → word list + accuracy + practice history
/practice/[word]      → per-word practice (main flow)
/practice/session     → multi-word session practice
/api/score            → POST scoring
/api/words            → GET word list
```

## Scoring

The scoring engine uses a deterministic heuristic strategy:

- **Audio score** (60% weight) — string similarity between spoken transcript and target word
- **Visual score** (40% weight) — distance from estimated mouth opening to an ideal based on word category
- **Total score** = weighted combination
- **Feedback**: Thai-language hints based on score thresholds

Scoring is heuristic/demo only — not clinically validated.

## Fallback Mode

When MediaPipe or Web Speech API is unavailable, the app runs in demo mode:
- MediaPipe fallback: generates random mouth-open values
- Speech fallback: returns `"demo-transcript"` with a fixed 45% audio score