export interface ScoreParams {
  wordId: string
  targetWord: string
  transcript: string
  mouthOpen: number
}

export interface ScoreResult {
  visualScore: number
  audioScore: number
  totalScore: number
  feedbackThai: string
}

export interface ScoringStrategy {
  score(params: ScoreParams): ScoreResult
}

export class DeterministicHeuristicStrategy implements ScoringStrategy {
  score(params: ScoreParams): ScoreResult {
    const audioScore = this.computeAudioScore(params.targetWord, params.transcript)
    const visualScore = this.computeVisualScore(params.mouthOpen, params.targetWord)
    const totalScore = Math.round(visualScore * 0.4 + audioScore * 0.6)
    const feedbackThai = this.generateHint(totalScore, audioScore, visualScore, params.mouthOpen)
    return { visualScore, audioScore, totalScore, feedbackThai }
  }

  private computeAudioScore(target: string, transcript: string): number {
    if (!transcript || transcript === "demo-transcript") return 45

    const norm = transcript.trim().toLowerCase()
    const targetNorm = target.trim().toLowerCase()

    if (norm === targetNorm) return 95
    if (norm.includes(targetNorm) || targetNorm.includes(norm)) return 75

    const overlap = norm.split("").filter((c) => targetNorm.includes(c)).length
    const maxLen = Math.max(norm.length, targetNorm.length)
    return Math.min(70, Math.floor((overlap / maxLen) * 70))
  }

  private computeVisualScore(mouthOpen: number, targetWord: string): number {
    if (mouthOpen <= 0) return 40
    const ideal = this.idealMouthOpen(targetWord)
    const diff = Math.abs(mouthOpen - ideal)
    if (diff <= 10) return 90
    if (diff <= 25) return 75
    if (diff <= 40) return 55
    return 40
  }

  private idealMouthOpen(targetWord: string): number {
    const wideWords = ["รัก", "ฝาก", "หมา", "ตา", "สาม", "ห้า", "แปด", "ฟ้า", "ฟัน", "ฝัน", "ขอบคุณ", "สวัสดี"]
    const roundedWords = ["ดู", "รู้", "วิ่ง", "สอง", "หก", "โชคดี"]
    const closedWords = ["แม่", "ไป", "มา", "พ่อ", "นอน", "หนึ่ง", "เจ็ด"]
    if (wideWords.some((w) => targetWord.includes(w))) return 70
    if (roundedWords.some((w) => targetWord.includes(w))) return 50
    if (closedWords.some((w) => targetWord.includes(w))) return 30
    return 55
  }

  private generateHint(
    total: number,
    audio: number,
    visual: number,
    mouthOpen: number,
  ): string {
    if (total >= 90) return "ยอดเยี่ยม! การออกเสียงและรูปปากของคุณดีมาก"
    if (audio < 50 && visual >= 60) return "ลองออกเสียงให้ชัดเจนขึ้น เน้นที่เสียงพูด"
    if (visual < 50 && audio >= 60) return "ลองอ้าปากให้กว้างขึ้นขณะออกเสียง"
    if (visual < 50 && audio < 50) return "ลองอ้าปากให้กว้างขึ้นและออกเสียงดังขึ้น"
    if (mouthOpen > 0 && mouthOpen < 25) return "ลองอ้าปากให้มากขึ้นเพื่อให้เห็นรูปปากชัดเจน"
    if (total >= 60) return "พอใช้ได้! ลองฝึกอีกครั้งเพื่อความแม่นยำที่มากขึ้น"
    return "ลองใหม่อีกครั้ง เน้นที่รูปปากและการออกเสียงให้ชัดเจน"
  }
}

export const defaultScoringStrategy = new DeterministicHeuristicStrategy()
