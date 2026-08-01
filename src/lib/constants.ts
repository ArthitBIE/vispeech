export const PASS_THRESHOLD = 70;
export const STREAK_GOAL = 10;

// Scoring weights (reference; actual weights in lib/scoring)
// session/page.tsx uses visual=0.7, audio=0.3
// lib/scoring uses visual=0.4, audio=0.6
export const SCORING_WEIGHTS = {
  VISUAL: 0.4,
  AUDIO: 0.6,
} as const;
