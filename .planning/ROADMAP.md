# Roadmap: vispeech

## Overview

vispeech is a Thai pronunciation training web app. v1 MVP is shipped and all v1 requirements are validated as done. The codebase has a critical gap: the real practice flow (MediaPipe + Web Speech + API scoring in `/practice/[word]`) is orphaned — no navigation reaches it. `/practice/session` is a mock. The roadmap prioritizes wiring the real flow into the user path, then adding enhanced features.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: v1 MVP** - Shipped: auth, dashboard, practice flow (mock), scoring API, Supabase schema, Thai UI
- [ ] **Phase 2: Real Practice Flow** - Wire `/practice/[word]` into navigation; replace mock `/practice/session`
- [ ] **Phase 3: Enhanced Scoring & Recording** - Clinically validated scoring algorithm; video recording of attempts
- [ ] **Phase 4: Admin & Infrastructure** - Auth middleware enforcement; API route cleanup; word management

## Phase Details

### Phase 1: v1 MVP
**Goal**: Deliver a functional Thai pronunciation practice app with auth, dashboard, mock practice session, scoring API, and Supabase backend.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01–04, DASH-01–05, PRAC-01–07, SCOR-01–05, SCHE-01–08, UI-01–05
**Success Criteria** (what must be TRUE):
  1. User can sign up, sign in, and sign out via email/password (Supabase)
  2. Authenticated user sees dashboard with progress summary (total words, avg score, attempts)
  3. Practice page shows camera preview with MediaPipe FaceMesh and speech recognition button
  4. Submitting an attempt saves scores to `practice_logs` and updates `word_accuracy`
  5. All user-facing text renders in Thai
**Plans**: 3 plans

Plans:
- [x] 01-01: Project structure, Supabase schema, and seed data
- [x] 01-02: Authentication flows (signin, signup, logout, redirect)
- [x] 01-03: Practice + scoring + dashboard (mock session + real [word] route + API)

### Phase 2: Real Practice Flow
**Goal**: Wire the real practice flow (`/practice/[word]`) into the user navigation path so learners reach the real MediaPipe + Web Speech + scoring pipeline. Replace the mock `/practice/session` stand-in.
**Depends on**: Phase 1
**Requirements**: PRAC-01–07 (re-validated against real flow)
**Success Criteria** (what must be TRUE):
  1. User navigates from dashboard/home to the real practice page (`/practice/[word]`)
  2. Practice page loads real word data from Supabase (not hardcoded `wordData`)
  3. Camera preview initializes MediaPipe FaceMesh; speech recognition starts with `th-TH`
  4. Submit attempt calls `/api/score` and displays real scores + Thai feedback
  5. E2E tests pass against the real practice flow
**Plans**: 2 plans

Plans:
- [ ] 02-01: Audit orphaned practice flow and wire navigation from dashboard/home
- [ ] 02-02: Replace mock `/practice/session` with real flow; update e2e tests

### Phase 3: Enhanced Scoring & Recording
**Goal**: Add clinically-validated scoring algorithm and video recording of practice attempts.
**Depends on**: Phase 2
**Requirements**: SCOR-06 (clinically validated scoring), PRAC-08 (video recording)
**Success Criteria** (what must be TRUE):
  1. Scoring algorithm references validated pronunciation metrics (not just heuristic transcript match)
  2. User can record video of practice attempt and review before submitting
  3. Recorded video + scores persist to practice logs
  4. Unit tests cover the new scoring strategy
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement clinically-validated scoring strategy (replace `DeterministicHeuristicStrategy`)
- [ ] 03-02: Add MediaStream video recording to practice flow; persist with attempt

### Phase 4: Admin & Infrastructure
**Goal**: Harden infrastructure — middleware auth enforcement, API route DRY refactor, and word management UI.
**Depends on**: Phase 3
**Requirements**: ADMN-01 (word management UI); infra hardening for all existing requirements
**Success Criteria** (what must be TRUE):
  1. Unauthenticated requests to `/dashboard`, `/home`, `/practice/*`, `/summary` redirect to `/auth/signin` via middleware
  2. API routes reuse `@/lib/supabase/server.ts` factory (no duplicated client creation)
  3. Admin can create, edit, delete, list words via UI backed by Supabase RPC
  4. No content flash on protected routes before auth redirect
**Plans**: 3 plans

Plans:
- [ ] 04-01: Add auth enforcement to middleware; remove client-side redirect flashes
- [ ] 04-02: Refactor API routes to use shared Supabase server client factory
- [ ] 04-03: Word management CRUD UI (ADMN-01)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. v1 MVP | 3/3 | Complete | 2026-08-01 |
| 2. Real Practice Flow | 0/2 | Not started | - |
| 3. Enhanced Scoring & Recording | 0/2 | Not started | - |
| 4. Admin & Infrastructure | 0/3 | Not started | - |
