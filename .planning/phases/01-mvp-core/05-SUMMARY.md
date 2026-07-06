---
phase: 01-mvp-core
plan: 05
subsystem: practice
tags: thai-ui, practice, camera, speech, mediapipe, scoring
requires:
  - phase: 02 (schema)
  - phase: 03 (auth)
  - phase: 04 (dashboard)
  - phase: 06 (libs)
provides:
  - Full Thai-language practice page with camera + speech + scoring
affects: plan 07
requirements-completed: [PRAC-01, PRAC-02, PRAC-03, PRAC-04, PRAC-05, PRAC-06, PRAC-07, UI-01, UI-02]
duration: 4min
completed: 2025-07-06
status: complete
---

# Phase 01-mvp-core Plan 05 Summary

**Thai-language practice page with camera, speech recognition, score submission, and results display**

## Accomplishments
- Word display with viseme group badge
- Camera preview with MediaPipe Face Mesh integration
- Speech recognition with Web Speech API for Thai
- Submit → /api/score → display results flow
- Save to practice_logs and word_accuracy via RPC
- Try again and back-to-dashboard navigation

## Task Commits
1. **Task 1-4: Practice page** - `1473ce0`

## Files Created/Modified
- `src/app/practice/[word]/page.tsx` - Full practice page

## Decisions Made
- Single SPA-like page with state transitions (not multi-page)
- RPC upsert_word_accuracy for atomic accuracy update
- Submit disabled until transcript or mouthOpen data exists
