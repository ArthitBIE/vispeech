# PROJECT.md

## What This Is

**vispeech** — a Next.js 16 web app that helps hearing-impaired Thai speakers improve pronunciation by combining real-time webcam-based mouth-shape analysis (MediaPipe Face Mesh) with browser speech recognition (Web Speech API, `th-TH`).

**Tagline:** ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด

## Core Value

Help hearing-impaired Thai speakers improve pronunciation accuracy and build speaking confidence through real-time analysis of mouth shape and speech. Success = a learner who sees measurable progress, feels encouraged to keep practicing, and eventually pronounces words naturally without the app's help.

## Context

### Domain
Thai pronunciation training for hearing-impaired learners. Thai has 5 tone classes, 21 consonants, 44 vowels (including diphthongs), and complex consonant clusters — making visual mouth-shape cues essential for accurate pronunciation. viseme grouping maps mouth positions to pronunciation categories.

### Project Stage
**Brownfield — v1 largely complete.** All 30 v1 requirements (AUTH, DASH, PRAC, SCOR, SCHE, UI) are marked Done. Codebase is functional with Supabase backend, MediaPipe FaceMesh, and Web Speech API integration. Current work focuses on wiring the real practice flow that was orphaned during the initial build.

### Target User
Thai high school student. Self-study context. Short, focused sessions (practice one word, get a score, move on). Access: after-school project time and weekends.

### Development Environment
- **Runtime:** OpenCode (primary dev agent), DeepSeek V4 Flash Free model
- **Package manager:** pnpm 11.13.1
- **Framework:** Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5 (strict)
- **Backend:** Supabase (PostgreSQL + Auth), RLS-enabled tables
- **Browser APIs required:** `getUserMedia` (camera), Web Speech API (`SpeechRecognition`) with `th-TH` locale

### Architecture Summary
- **3-layer client/server hybrid:** Pages (App Router) → UI Components → `src/lib/` (integration glue: Supabase, MediaPipe, viseme, scoring) → API Routes (thin Supabase proxies) → Supabase DB
- **Graceful degradation everywhere:** placeholder Supabase values → demo mode; MediaPipe load failure → fallback instance; Web Speech unavailable → fallback recognizer
- **Scoring:** Strategy pattern (`ScoringStrategy` interface + `DeterministicHeuristicStrategy`); 40% visual + 60% audio weighted average
- **Layout shells:** `AppShell` (Sidebar + Header, for authenticated routes), `HeaderOnlyShell` (Header + main, for practice/summary routes)

### Key Concerns
1. **Real practice flow is orphaned:** `/practice/[word]` (the only route wiring MediaPipe → Web Speech → `/api/score`) is unreachable from any navigation. `/practice/session` is 100% hardcoded mock data. The core value proposition is not shipped to users.
2. **Middleware doesn't enforce auth:** Pass-through only; client-side redirects cause content flash.
3. **API routes duplicate Supabase client creation:** Each route creates its own `createClient()` instead of reusing `@/lib/supabase/server.ts`.
4. **Stale verification contract:** `e2e/nsc-verify.mjs` expects UI elements that don't exist (e.g., `data-testid="dashboard-word-card"`).

## Requirements

### Validated
- ✓ **AUTH-01–04**: Supabase email/password auth; session persistence; logout; root redirect
- ✓ **DASH-01–05**: Dashboard shows progress summary, per-word accuracy table, practice history, Thai empty states
- ✓ **PRAC-01–03**: Practice page loads word by slug; shows Thai word + viseme group; MediaPipe FaceMesh camera preview with demo fallback
- ✓ **PRAC-04–07**: Web Speech API (`th-TH`) with fallback; attempt submission; scoring with Thai feedback; save to `practice_logs` + `word_accuracy`
- ✓ **SCOR-01–05**: POST `/api/score` returns visual/audio/total scores + Thai feedback; heuristic audio comparison; mouth-open visual score fallback
- ✓ **SCHE-01–08**: Supabase schema (words, practice_logs, word_accuracy, practice_sessions); RLS policies; 30 seed words across 7 viseme groups
- ✓ **UI-01–05**: All UI text in Thai; responsive laptop layout; includes product copy strings

### Active
- **SCOR-06**: Clinically validated scoring algorithm (v2 — not heuristic)
- **PRAC-08**: Video recording of practice attempts (v2)
- **ADMN-01**: Word management UI (CRUD) (v2)
- **(Brownfield gap):** Wire `/practice/[word]` real flow into the user navigation path (replace mock `/practice/session`)

### Out of Scope
| Feature | Reason |
|---------|--------|
| Teacher dashboard | Not in MVP scope; focus on individual learner |
| Multi-language support | Thai-only for MVP; hearing-impaired Thai speakers are target |
| Complex adaptive learning UI | Simple practice flow sufficient for demo |
| Payments / billing | Not applicable for MVP |
| Social login (OAuth) | Email/password sufficient for MVP |
| Admin panels | Word management via raw DB for MVP |

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Strategy pattern for scoring | Decouples score computation from API route, enables future algorithm swaps | `ScoringStrategy` interface + `DeterministicHeuristicStrategy` in `src/lib/scoring/index.ts` |
| Factory pattern for MediaPipe FaceMesh | Lazy-load `@mediapipe/face_mesh` (excluded from server bundle via `serverExternalPackages`) | `initFaceMesh()` returns real or fallback instance |
| Factory pattern for speech recognition | Web Speech API varies across browsers; auto-fallback needed | `createSpeechRecognizer("th-TH")` with `createFallbackRecognizer()` |
| Route groups for layout scoping | Next.js App Router: nested layouts nest within parent layouts | `(app)` group → `AppShell`; `practice/` + `summary/` → `HeaderOnlyShell` |
| 40% visual + 60% audio scoring weight | Audio match is more directly correlated with pronunciation accuracy than mouth-open heuristic | `total_score = round(0.4 * visual_score + 0.6 * audio_score)` |
| Graceful degradation over error screens | Learner sessions must be uninterrupted; fallback to demo data when APIs unavailable | `isSupabaseConfigured` guard, MediaPipe fallback instance, Web Speech fallback recognizer |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-08-01 after initialization*
