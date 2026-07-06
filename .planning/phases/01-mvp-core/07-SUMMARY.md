---
phase: 01-mvp-core
plan: 07
subsystem: scoring
tags: api, scoring, heuristic, thai-feedback
requires:
  - phase: 01 (foundation)
  - phase: 02 (schema)
  - phase: 05 (practice page)
provides:
  - POST /api/score endpoint with heuristic scoring
  - Thai feedback per score tier
  - Auto-save to practice_logs and word_accuracy
affects: none
requirements-completed: [SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05, PRAC-06]
duration: 3min
completed: 2025-07-06
status: complete
---

# Phase 01-mvp-core Plan 07 Summary

**POST /api/score endpoint with heuristic audio/visual scoring and Thai feedback**

## Accomplishments
- Audio score via character-level string similarity
- Visual score from mouth openness (0-100 mapped to 20-95)
- Total score: 40% visual + 60% audio weighted
- Thai feedback per tier (≥90 / ≥75 / ≥60 / ≥40 / <40)
- Auto-save to practice_logs and word_accuracy
- Removed double-save from practice page

## Task Commits
1. **Task 1: Scoring API** - `c97ab97`

## Files Created/Modified
- `src/app/api/score/route.ts` - Scoring API POST handler
- `src/app/practice/[word]/page.tsx` - Removed double-save

## Decisions Made
- API handles all DB writes (practice_logs + word_accuracy)
- visual_features replaced with flat mouthOpen for simplicity
- HEURISTIC — NOT clinically validated disclaimer in code
