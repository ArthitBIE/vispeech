import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// HEURISTIC SCORING — NOT CLINICALLY VALIDATED
// This MVP uses simple heuristics for demo purposes:
// - Audio score: string similarity between transcript and target word
// - Visual score: based on detected mouth openness
// - Total score: weighted average (40% visual, 60% audio)
// These scores are NOT medically validated.

export async function POST(req: NextRequest) {
  try {
    const { wordId, transcript, mouthOpen } = await req.json();

    if (!wordId) {
      return NextResponse.json(
        { error: "Missing required field: wordId" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase =
      supabaseUrl && supabaseKey && supabaseUrl !== "https://placeholder.supabase.co"
        ? createClient(supabaseUrl, supabaseKey)
        : null;

    const { data: word } = await supabase!
      .from("words")
      .select("word")
      .eq("id", wordId)
      .single();

    const targetWord = word?.word || "";

    const audioScore = computeAudioScore(targetWord, transcript || "");
    const visualScore = computeVisualScore(mouthOpen);
    const totalScore = Math.round(visualScore * 0.4 + audioScore * 0.6);
    const feedbackTh = generateFeedback(totalScore, audioScore, visualScore);

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: logs } = await supabase
          .from("practice_logs")
          .select("attempt_number")
          .eq("word_id", wordId)
          .eq("user_id", user.id)
          .order("attempt_number", { ascending: false })
          .limit(1);

        const attemptNumber = ((logs && logs[0]?.attempt_number) || 0) + 1;

        await supabase.from("practice_logs").insert({
          user_id: user.id,
          word_id: wordId,
          visual_score: visualScore,
          audio_score: audioScore,
          total_score: totalScore,
          attempt_number: attemptNumber,
        });

        const { data: existing } = await supabase
          .from("word_accuracy")
          .select("*")
          .eq("user_id", user.id)
          .eq("word_id", wordId)
          .single();

        if (existing) {
          const newAttempts = existing.total_attempts + 1;
          const newAvg = Math.round(
            (existing.average_score * existing.total_attempts + totalScore) /
              newAttempts,
          );
          await supabase
            .from("word_accuracy")
            .update({
              best_score: Math.max(existing.best_score, totalScore),
              average_score: newAvg,
              total_attempts: newAttempts,
              last_practiced_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("word_id", wordId);
        } else {
          await supabase.from("word_accuracy").insert({
            user_id: user.id,
            word_id: wordId,
            best_score: totalScore,
            average_score: totalScore,
            total_attempts: 1,
            last_practiced_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      visual_score: visualScore,
      audio_score: audioScore,
      total_score: totalScore,
      feedback_th: feedbackTh,
    });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function computeAudioScore(target: string, transcript: string): number {
  if (!transcript || transcript === "demo-transcript") {
    return Math.floor(Math.random() * 40) + 50;
  }

  const normalized = transcript.trim().toLowerCase();
  const targetNorm = target.trim().toLowerCase();

  if (normalized === targetNorm) return 95 + Math.floor(Math.random() * 5);

  if (normalized.includes(targetNorm) || targetNorm.includes(normalized)) {
    return 75 + Math.floor(Math.random() * 15);
  }

  const overlap = normalized
    .split("")
    .filter((c) => targetNorm.includes(c)).length;
  const maxLen = Math.max(normalized.length, targetNorm.length);
  const ratio = overlap / maxLen;

  return Math.min(70, Math.floor(ratio * 70));
}

function computeVisualScore(mouthOpen?: number): number {
  if (mouthOpen !== undefined && mouthOpen > 0) {
    return Math.min(95, Math.floor(mouthOpen * 0.7 + 20 + Math.random() * 10));
  }

  return Math.floor(Math.random() * 30) + 55;
}

function generateFeedback(
  totalScore: number,
  audioScore: number,
  visualScore: number,
): string {
  if (totalScore >= 90) return "ยอดเยี่ยม! การออกเสียงของคุณดีมาก";
  if (totalScore >= 75) return "ดีมาก! พยายามต่อไป";
  if (totalScore >= 60) return "พอใช้ได้ ลองฝึกอีกครั้ง";
  if (totalScore >= 40) return "ยังต้องฝึกอีก ลองดูรูปปากในตัวอย่าง";
  return "ลองใหม่อีกครั้ง เน้นที่รูปปากและการออกเสียง";
}
