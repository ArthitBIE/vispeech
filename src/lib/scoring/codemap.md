# src/lib/scoring/

## Responsibility

Pure, deterministic scoring engine: combines visual (mouth openness) and audio (transcript) signals into a weighted total score plus Thai-language feedback. No I/O, no state — only math over inputs.

## Design

- **Strategy pattern**: `ScoringStrategy` interface (`score(params): ScoreResult`) with a single implementation, `DeterministicHeuristicStrategy`. Pluggable alternative strategies can be swapped behind the interface.
- **Heuristic scoring**: no ML/model — rule-based approximations of the original MediaPipe visual + Web Speech audio pipeline.
  - Audio: string similarity ladder — exact match (95) → containment (75) → per-character overlap ratio scaled to ≤70 → empty/fallback transcript 45.
  - Visual: mouth-open deviation from an ideal percentage per Thai viseme group (`idealMouthOpen` map, taxonomy from `supabase/migrations/`); banded differences (≤10/≤25/≤40 → 90/75/55/40).
- **Weighted composite**: `totalScore = round(visualScore * SCORING_WEIGHTS.VISUAL (0.7) + audioScore * SCORING_WEIGHTS.AUDIO (0.3))` from `@/lib/constants`.
- **Rule-based hint generation**: `generateHint` selects Thai feedback string from total/audio/visual thresholds (priority-ordered if/else).
- **Singleton export**: `defaultScoringStrategy` instance consumed app-wide.
- Deterministic by design → unit-testable without mocks (`__tests__/strategy.test.ts` covers each band and ladder rung).

## Flow

1. Caller (e.g. `POST /api/score`) builds `ScoreParams` from request: `targetWord` (resolved from DB `words` row or `targetText`), `transcript`, `mouthOpen`, `visemeGroup` (from DB `viseme_group` or request).
2. `defaultScoringStrategy.score(params)`:
   - `computeAudioScore(targetWord, transcript)` → 0–95
   - `computeVisualScore(mouthOpen, visemeGroup)` → 40–90
   - weighted blend → `totalScore`
   - `generateHint(...)` → `feedbackThai`
3. Returns `ScoreResult { visualScore, audioScore, totalScore, feedbackThai }`; API serializes as `visual_score/audio_score/total_score/feedback_th`. Module itself never persists.

## Integration

- Consumed by: `src/app/api/score/route.ts` (imports `defaultScoringStrategy`, calls `score()` per request, persists results into Supabase `practice_logs` and `word_accuracy`); Vitest `__tests__/strategy.test.ts`.
- Depends on: `SCORING_WEIGHTS` from `@/lib/constants`; viseme-group taxonomy assumed from DB migrations (`words.viseme_group` values: ริมฝีปากปิด, ปากเปิดกว้าง, ปากห่อกลม, ฟันแตะริมฝีปาก, ปากเปิดกลาง, ทักทาย, ตัวเลข).
