import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { defaultScoringStrategy } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  try {
    const {
      wordId,
      transcript,
      mouthOpen,
      sessionId,
      targetText,
      visemeGroup,
      confidence,
    } = await req.json();

    if (!wordId && !targetText) {
      return NextResponse.json(
        { error: "Missing required field: wordId or targetText" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl &&
      supabaseKey &&
      supabaseUrl !== "https://placeholder.supabase.co";

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    const supabase = canConnect
      ? createClient(
          supabaseUrl!,
          supabaseKey!,
          token
            ? { global: { headers: { Authorization: `Bearer ${token}` } } }
            : undefined
        )
      : null;

    // Synthetic ids (lesson item text not in DB) resolve to no row → null.
    let word: { word: string; viseme_group: string } | null = null;
    if (supabase && wordId) {
      const { data } = await supabase
        .from("words")
        .select("word, viseme_group")
        .eq("id", wordId)
        .single();
      word = data;
    }

    const targetWord = word?.word || targetText || "";
    const result = defaultScoringStrategy.score({
      wordId,
      targetWord,
      transcript: transcript || "",
      mouthOpen: mouthOpen || 0,
      visemeGroup: word?.viseme_group || visemeGroup || undefined,
      confidence: confidence != null ? Number(confidence) : undefined,
    });

    // Persist only for real DB words; synthetic lesson items are scored
    // without touching practice_logs / word_accuracy.
    if (supabase && word) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: logs } = await supabase
          .from("practice_logs")
          .select("attempt_number")
          .eq("word_id", wordId)
          .eq("user_id", user.id)
          .order("attempt_number", { ascending: false })
          .limit(1);

        const attemptNumber = ((logs && logs[0]?.attempt_number) || 0) + 1;

        // Verify ownership before linking a log to a session.
        let sessionOwned = false;
        if (sessionId) {
          const { data: session } = await supabase
            .from("practice_sessions")
            .select("id")
            .eq("id", sessionId)
            .eq("user_id", user.id)
            .maybeSingle();
          sessionOwned = !!session;
        }

        const { error: insertError } = await supabase
          .from("practice_logs")
          .insert({
            user_id: user.id,
            word_id: wordId,
            visual_score: result.visualScore,
            audio_score: result.audioScore,
            total_score: result.totalScore,
            attempt_number: attemptNumber,
            // ponytail: session_id included only when the caller's sessionId
            // belongs to this user; otherwise dropped to keep inserts working.
            ...(sessionOwned ? { session_id: sessionId } : {}),
          });

        // ponytail: hosted DB predates migration 003 (no practice_logs.session_id),
        // so session-linked insert fails with PGRST204; retry without session_id.
        if (insertError && sessionOwned && insertError.code === "PGRST204") {
          await supabase.from("practice_logs").insert({
            user_id: user.id,
            word_id: wordId,
            visual_score: result.visualScore,
            audio_score: result.audioScore,
            total_score: result.totalScore,
            attempt_number: attemptNumber,
          });
        }

        const { data: existing } = await supabase
          .from("word_accuracy")
          .select("*")
          .eq("user_id", user.id)
          .eq("word_id", wordId)
          .maybeSingle();

        if (existing) {
          const newAttempts = existing.total_attempts + 1;
          const newAvg = Math.round(
            (existing.average_score * existing.total_attempts +
              result.totalScore) /
              newAttempts
          );
          await supabase
            .from("word_accuracy")
            .update({
              best_score: Math.max(existing.best_score, result.totalScore),
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
            best_score: result.totalScore,
            average_score: result.totalScore,
            total_attempts: 1,
            last_practiced_at: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      visual_score: result.visualScore,
      audio_score: result.audioScore,
      total_score: result.totalScore,
      feedback_th: result.feedbackThai,
    });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
