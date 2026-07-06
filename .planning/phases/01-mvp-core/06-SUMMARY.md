---
phase: 01-mvp-core
plan: 06
subsystem: libs
tags: mediapipe, face-mesh, web-speech-api, fallback
requires:
  - phase: 01
    provides: project foundation
provides:
  - MediaPipe Face Mesh abstraction (FaceMeshInstance + FaceMeshResult)
  - Web Speech API abstraction (SpeechRecognizer + SpeechResult)
  - Seamless demo fallbacks for both APIs
affects: plan 05
requirements-completed: [PRAC-03, PRAC-04]
duration: 3min
completed: 2025-07-06
status: complete
---

# Phase 01-mvp-core Plan 06 Summary

**MediaPipe Face Mesh and Web Speech API abstraction layers with graceful demo fallbacks**

## Accomplishments
- FaceMeshInstance: typed start/stop/isActive/onResult API
- Real MediaPipe integration with Camera + drawConnectors
- Demo fallback with simulated mouth-open values (20-80 range)
- SpeechRecognizer: typed start/stop/isAvailable/onResult/onError API
- Real Web Speech API with Thai (th-TH) and interim results
- Demo fallback with Thai error message
- mouthOpen estimation from lip landmarks

## Task Commits
1. **Task 1: MediaPipe abstraction** - `36d0d5f`
2. **Task 2: Web Speech abstraction** - `36d0d5f`

## Files Created/Modified
- `src/lib/mediapipe/index.ts` - FaceMeshInstance + fallback
- `src/lib/viseme/index.ts` - SpeechRecognizer + fallback

## Decisions Made
- Seamless fallback: practice page never knows which mode is active
- Demo mode fires callbacks at 500ms intervals for realistic UX
- mouthOpen uses lip landmarks 13/14 distance scaled to 0-100
