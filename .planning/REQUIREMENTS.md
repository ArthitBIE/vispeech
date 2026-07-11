# Requirements: vispeech

**Defined:** 2025-07-06
**Core Value:** Help hearing-impaired Thai speakers improve pronunciation by combining visual mouth-shape analysis with audio-based tone verification

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password via Supabase Auth
- [x] **AUTH-02**: Authenticated session survives page refresh; unauthenticated users redirected to /auth
- [x] **AUTH-03**: User can log out from dashboard
- [x] **AUTH-04**: Root `/` redirects authenticated users to /dashboard, others to /auth

### Dashboard

- [x] **DASH-01**: Dashboard displays app name "vispeech" and Thai product explanation
- [x] **DASH-02**: Dashboard displays user progress summary (total practiced words, average score, total attempts)
- [x] **DASH-03**: Dashboard displays per-word accuracy table (word, viseme group, best score, average score, total attempts, last practiced, practice button)
- [x] **DASH-04**: Dashboard displays practice history (date/time, word, visual score, audio score, total score), newest first
- [x] **DASH-05**: Dashboard shows Thai empty states when no practice data exists

### Practice Flow

- [x] **PRAC-01**: Practice page loads word from Supabase by slug
- [x] **PRAC-02**: Page shows Thai word prominently with viseme group and practice goal explanation in Thai
- [x] **PRAC-03**: Page shows camera preview with MediaPipe Face Mesh integration (or fallback demo mode)
- [x] **PRAC-04**: Page provides microphone/speech recognition button using Web Speech API lang="th-TH" (or Thai fallback message)
- [x] **PRAC-05**: User can submit attempt; scores are calculated and displayed with Thai feedback
- [x] **PRAC-06**: Attempt is saved to practice_logs; word_accuracy is upserted
- [x] **PRAC-07**: Buttons: Start camera, Start speaking, Submit attempt, Try again, Back to dashboard

### Scoring API

- [x] **SCOR-01**: POST /api/score accepts { word_id, target_word, transcript, visual_features }
- [x] **SCOR-02**: Response includes { visual_score (0-100), audio_score (0-100), total_score (0-100), feedback_th }
- [x] **SCOR-03**: Audio score compares transcript to target word (heuristic)
- [x] **SCOR-04**: Visual score uses detected mouth movement or fallback random range
- [x] **SCOR-05**: Total score = rounded weighted average (e.g., 40% visual + 60% audio)

### Database Schema

- [x] **SCHE-01**: words table: id (uuid PK), word (text), viseme_group (text), audio_url (text nullable), difficulty (int)
- [x] **SCHE-02**: practice_logs table: id (uuid PK), user_id (uuid FK to auth.users), word_id (uuid FK to words), visual_score (int), audio_score (int), total_score (int), attempt_number (int), created_at (timestamptz)
- [x] **SCHE-03**: word_accuracy table: user_id (uuid FK to auth.users), word_id (uuid FK to words), best_score (int), average_score (float), total_attempts (int), last_practiced_at (timestamptz). Composite PK (user_id, word_id)
- [x] **SCHE-04**: RLS enabled on all tables
- [x] **SCHE-05**: RLS policy: authenticated users can SELECT words
- [x] **SCHE-06**: RLS policy: users can INSERT/SELECT their own practice_logs
- [x] **SCHE-07**: RLS policy: users can INSERT/SELECT/UPDATE their own word_accuracy rows
- [x] **SCHE-08**: Seed data: 30 Thai words across 7 viseme groups

### UI

- [x] **UI-01**: All user-facing text rendered in Thai
- [x] **UI-02**: Responsive laptop demo layout
- [x] **UI-03**: Copy includes: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด"
- [x] **UI-04**: Copy includes: "ระบบนี้ช่วยให้ผู้ใช้เห็นคะแนนความแม่นยำของแต่ละคำ และติดตามพัฒนาการย้อนหลังได้"
- [x] **UI-05**: Copy includes: "สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก"

## v2 Requirements

- **SCOR-06**: Clinically validated scoring algorithm
- **PRAC-08**: Video recording of practice attempts
- **ADMN-01**: Word management UI (CRUD)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Teacher dashboard | Not in MVP scope; focus on individual learner |
| Multi-language support | Thai-only for MVP; hearing-impaired Thai speakers are target |
| Complex adaptive learning UI | Simple practice flow sufficient for demo |
| Payments / billing | Not applicable for MVP |
| Social login (OAuth) | Email/password sufficient for MVP |
| Admin panels | Word management via raw DB for MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Done |
| AUTH-02 | Phase 1 | Done |
| AUTH-03 | Phase 1 | Done |
| AUTH-04 | Phase 1 | Done |
| DASH-01 | Phase 1 | Done |
| DASH-02 | Phase 1 | Done |
| DASH-03 | Phase 1 | Done |
| DASH-04 | Phase 1 | Done |
| DASH-05 | Phase 1 | Done |
| PRAC-01 | Phase 1 | Done |
| PRAC-02 | Phase 1 | Done |
| PRAC-03 | Phase 1 | Done |
| PRAC-04 | Phase 1 | Done |
| PRAC-05 | Phase 1 | Done |
| PRAC-06 | Phase 1 | Done |
| PRAC-07 | Phase 1 | Done |
| SCOR-01 | Phase 1 | Done |
| SCOR-02 | Phase 1 | Done |
| SCOR-03 | Phase 1 | Done |
| SCOR-04 | Phase 1 | Done |
| SCOR-05 | Phase 1 | Done |
| SCHE-01 | Phase 1 | Done |
| SCHE-02 | Phase 1 | Done |
| SCHE-03 | Phase 1 | Done |
| SCHE-04 | Phase 1 | Done |
| SCHE-05 | Phase 1 | Done |
| SCHE-06 | Phase 1 | Done |
| SCHE-07 | Phase 1 | Done |
| SCHE-08 | Phase 1 | Done |
| UI-01 | Phase 1 | Done |
| UI-02 | Phase 1 | Done |
| UI-03 | Phase 1 | Done |
| UI-04 | Phase 1 | Done |
| UI-05 | Phase 1 | Done |

---

*Requirements defined: 2025-07-06*
