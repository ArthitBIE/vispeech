import { SCORING_WEIGHTS } from "@/lib/constants";

function applyConfidence(score: number, confidence?: number): number {
  if (confidence == null || confidence < 0) return score;
  // Blend: high confidence keeps full score, low confidence penalizes
  return Math.round(score * (0.5 + Math.min(1, confidence) * 0.5));
}

export interface ScoreParams {
  wordId: string;
  targetWord: string;
  transcript: string;
  mouthOpen: number;
  visemeGroup?: string;
  confidence?: number; // ADD THIS — Web Speech API confidence [0,1]
}

export interface ScoreResult {
  visualScore: number;
  audioScore: number;
  totalScore: number;
  feedbackThai: string;
}

export interface ScoringStrategy {
  score(params: ScoreParams): ScoreResult;
}

export class DeterministicHeuristicStrategy implements ScoringStrategy {
  score(params: ScoreParams): ScoreResult {
    const audioScore = this.computeAudioScore(
      params.targetWord,
      params.transcript,
      params.confidence
    );
    const visualScore = this.computeVisualScore(
      params.mouthOpen,
      params.visemeGroup
    );
    const totalScore = Math.round(
      visualScore * SCORING_WEIGHTS.VISUAL + audioScore * SCORING_WEIGHTS.AUDIO
    );
    const feedbackThai = this.generateHint(
      totalScore,
      audioScore,
      visualScore,
      params.mouthOpen
    );
    return { visualScore, audioScore, totalScore, feedbackThai };
  }

  private computeAudioScore(
    target: string,
    transcript: string,
    confidence?: number
  ): number {
    const norm = target.trim(); // No toLowerCase — Thai has no case
    const transcriptNorm = transcript.trim();

    // No transcript or demo fallback — score is 0 (no real speech detected)
    if (!transcriptNorm) return 0;

    // Exact match
    if (transcriptNorm === norm) return 100;

    // Thai prefix match — e.g. user says "รัก" when target is "รักสด" → decent
    // partial. Must precede containment: a prefix is always contained, so
    // checking containment first would make this branch unreachable.
    if (norm.startsWith(transcriptNorm) || transcriptNorm.startsWith(norm)) {
      const shorter = Math.min(transcriptNorm.length, norm.length);
      const longer = Math.max(transcriptNorm.length, norm.length);
      const prefixScore = Math.round(65 * (shorter / longer));
      return applyConfidence(prefixScore, confidence);
    }

    // Containment (either direction)
    if (transcriptNorm.includes(norm) || norm.includes(transcriptNorm))
      return 75;

    // Character overlap (fallback for Thai syllabic script)
    const overlap = transcriptNorm
      .split("")
      .filter((c) => norm.includes(c)).length;
    const maxLen = Math.max(transcriptNorm.length, norm.length);
    const overlapScore = Math.min(60, Math.floor((overlap / maxLen) * 60));

    return applyConfidence(overlapScore, confidence);
  }

  private computeVisualScore(mouthOpen: number, visemeGroup?: string): number {
    // No face detected — score is 0 (no real visual data)
    if (mouthOpen <= 0) return 0;
    const ideal = this.idealMouthOpen(visemeGroup);
    const diff = Math.abs(mouthOpen - ideal);
    if (diff <= 10) return 100;
    if (diff <= 25) return 75;
    if (diff <= 40) return 55;
    return 40;
  }

  private idealMouthOpen(visemeGroup?: string): number {
    // Ideal mouth-open % per DB viseme_group taxonomy (supabase/migrations/).
    const groupMap: Record<string, number> = {
      ริมฝีปากปิด: 30,
      ปากเปิดกว้าง: 70,
      ปากห่อกลม: 50,
      ฟันแตะริมฝีปาก: 55,
      ปากเปิดกลาง: 55,
      ทักทาย: 55,
      ตัวเลข: 55,
    };
    return visemeGroup ? (groupMap[visemeGroup] ?? 55) : 55;
  }

  private generateHint(
    total: number,
    audio: number,
    visual: number,
    mouthOpen: number
  ): string {
    if (audio === 0 && visual === 0)
      return "ไม่พบข้อมูลการพูด กรุณาตรวจสอบไมโครโฟนและกล้อง";
    if (audio === 0) return "ไม่พบเสียงพูด กรุณาตรวจสอบไมโครโฟน";
    if (visual === 0) return "ไม่พบรูปปาก กรุณาตรวจสอบกล้อง";
    if (total >= 90) return "ยอดเยี่ยม! การออกเสียงและรูปปากของคุณดีมาก";
    if (audio < 50 && visual >= 60)
      return "ลองออกเสียงให้ชัดเจนขึ้น เน้นที่เสียงพูด";
    if (visual < 50 && audio >= 60) return "ลองอ้าปากให้กว้างขึ้นขณะออกเสียง";
    if (visual < 50 && audio < 50)
      return "ลองอ้าปากให้กว้างขึ้นและออกเสียงดังขึ้น";
    if (mouthOpen > 0 && mouthOpen < 25)
      return "ลองอ้าปากให้มากขึ้นเพื่อให้เห็นรูปปากชัดเจน";
    if (total >= 60) return "พอใช้ได้! ลองฝึกอีกครั้งเพื่อความแม่นยำที่มากขึ้น";
    return "ลองใหม่อีกครั้ง เน้นที่รูปปากและการออกเสียงให้ชัดเจน";
  }
}

export const defaultScoringStrategy = new DeterministicHeuristicStrategy();
