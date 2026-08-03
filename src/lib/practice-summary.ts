export interface PracticeResult {
  word: string;
  phonetic: string;
  viseme_group: string;
  visual_score: number;
  audio_score: number;
  total_score: number;
  attempt_number: number;
  created_at: string;
}

export function dedupeByBestScore(results: PracticeResult[]): PracticeResult[] {
  const best = new Map<string, PracticeResult>();
  for (const r of results) {
    const prev = best.get(r.word);
    if (!prev || r.total_score > prev.total_score) best.set(r.word, r);
  }
  // Keep first-occurrence position, but substitute the best-scoring attempt.
  const seen = new Set<string>();
  const out: PracticeResult[] = [];
  for (const r of results) {
    if (seen.has(r.word)) continue;
    seen.add(r.word);
    out.push(best.get(r.word)!);
  }
  return out;
}
