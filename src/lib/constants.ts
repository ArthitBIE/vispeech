export const PASS_THRESHOLD = 75;
export const STREAK_GOAL = 10;

// Scoring weights (reference; actual weights in lib/scoring)
// Per-word score: (Lip Score × 0.7) + (Voice Score × 0.3)
export const SCORING_WEIGHTS = {
  VISUAL: 0.7,
  AUDIO: 0.3,
} as const;
