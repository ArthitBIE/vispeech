# vispeech

## What This Is

A Thai speech training web application for hearing-impaired individuals in Thailand, using facial landmark detection (MediaPipe Face Mesh) and browser speech recognition (Web Speech API) to provide real-time pronunciation feedback. Built with Next.js App Router + TypeScript + Supabase.

## Core Value

Help hearing-impaired Thai speakers improve pronunciation by combining visual mouth-shape analysis with audio-based tone verification, providing measurable accuracy feedback.

## Requirements

### Active

- [ ] **AUTH-01**: User can sign up and log in with email/password via Supabase Auth
- [ ] **AUTH-02**: Authenticated session persists and redirects to /dashboard
- [ ] **AUTH-03**: User can log out
- [ ] **DASH-01**: Dashboard shows total practiced words, average score, total attempts
- [ ] **DASH-02**: Dashboard shows per-word accuracy table (word, viseme group, best/average score, attempts, last practiced, practice button)
- [ ] **DASH-03**: Dashboard shows practice history grouped by date with scores
- [ ] **DASH-04**: Dashboard shows friendly Thai empty states when no data exists
- [ ] **PRAC-01**: User can select a word and load its practice page
- [ ] **PRAC-02**: Practice page shows Thai word prominently with viseme group info
- [ ] **PRAC-03**: Camera preview displays with MediaPipe Face Mesh (or graceful fallback)
- [ ] **PRAC-04**: Microphone captures speech via Web Speech API with lang="th-TH" (or fallback message)
- [ ] **PRAC-05**: User can submit attempt and receive visual/audio/total scores with Thai feedback
- [ ] **PRAC-06**: Scores are saved to practice_logs and word_accuracy via Supabase
- [ ] **SCOR-01**: POST /api/score accepts word_id, target_word, transcript, visual_features
- [ ] **SCOR-02**: POST /api/score returns visual_score, audio_score, total_score, feedback_th
- [ ] **SCHE-01**: words table with id, word, viseme_group, audio_url, difficulty
- [ ] **SCHE-02**: practice_logs table with user_id, word_id, scores, attempt_number, created_at
- [ ] **SCHE-03**: word_accuracy table with best_score, average_score, total_attempts, last_practiced_at
- [ ] **SCHE-04**: RLS policies — authenticated users read words, users CRUD own practice/accuracy data
- [ ] **SCHE-05**: Seed data for 30 Thai words across 7 viseme groups
- [ ] **UI-01**: All user-facing text in Thai
- [ ] **UI-02**: Responsive laptop demo layout
- [ ] **UI-03**: Copy explaining audio-first tones, visual-first consonants

### Out of Scope

- Teacher dashboard — not in MVP scope
- Multi-language support — Thai only for MVP
- Complex adaptive learning UI — simple practice flow only
- Clinically validated scoring — heuristic/placeholder demo values
- Admin panels, payments, chat
- OAuth / social login — email/password only

## Constraints

- **Deadline**: August 1, 2026
- **Current date**: July 6, 2026
- **Tech stack**: Next.js App Router, TypeScript, Supabase, MediaPipe Face Mesh
- **Auth**: Supabase Auth (email/password only)
- **UI language**: Thai (no translations)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + TypeScript | Modern React, file-based routing, API routes | ✓ Good |
| Supabase Auth + Database | Unified platform, built-in RLS, easy integration | ✓ Good |
| MediaPipe Face Mesh | Browser-based facial landmark detection without backend | — Pending |
| Web Speech API (th-TH) | Native browser speech recognition for Thai | — Pending |
| Heuristic scoring (not ML) | MVP pragmatism; scores are demo-quality, not clinical | — Pending |
| Thai-only UI | Target users are Thai-speaking hearing-impaired individuals | ✓ Good |
| Supabase email/password auth | Simplest auth that works cross-browser | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

---

*Last updated: 2025-07-06 after initialization*
