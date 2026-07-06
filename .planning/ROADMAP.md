# vispeech Roadmap

**Deadline:** August 1, 2026
**Current Date:** July 6, 2026

## Phase 1: MVP Core — Walking Skeleton

**Goal:** Build a demo-ready MVP with auth, dashboard, practice flow, scoring, and Thai UI.

**Deliverables:**
- Next.js App Router + TypeScript project
- Supabase client utilities
- Database schema (words, practice_logs, word_accuracy) + seed data (30 Thai words)
- Auth page (/auth) with Supabase email/password
- Dashboard (/dashboard) with word list, accuracy table, practice history
- Practice page (/practice/[word]) with camera + mic + scoring
- API scoring route (/api/score) with heuristic scoring
- MediaPipe Face Mesh + Web Speech API abstractions with fallback
- Thai UI throughout
- `npm run build` passes (except missing Supabase env vars)

**Estimated effort:** 8 waves / ~3-5 days

## Phase 2: Enhanced Practice & Accuracy

**Goal:** Improve scoring feedback, add practice session history, polish the practice flow.

**Deliverables:**
- Better visual score based on actual mouth-shape detection
- Session-based practice (multiple words in one session)
- Practice history detail view
- Improved Thai feedback messages
- Camera calibration / position guide

## Phase 3: Vocabulary & Word Management

**Goal:** Expand vocabulary, add admin word management.

**Deliverables:**
- Simple admin word CRUD interface
- Expand to 50+ words
- Audio upload for reference pronunciations
- Difficulty-based word filtering on dashboard

## Phase 4: Demo Polish & Launch Prep

**Goal:** Polish for stakeholder demo and public launch.

**Deliverables:**
- UI refinements and responsive fixes
- Error handling and edge cases
- Loading states and transitions
- Performance optimization
- Documentation and setup guide

---

**Total phases:** 4
**MVP deadline:** August 1, 2026
