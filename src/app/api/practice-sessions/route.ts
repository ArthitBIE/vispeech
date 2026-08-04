import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dedupeByBestScore } from "@/lib/practice-summary";
import { findLesson, type Lesson } from "@/lib/lesson";

function filterByLesson(
  results: {
    word: string;
    phonetic: string;
    viseme_group: string;
    visual_score: number;
    audio_score: number;
    total_score: number;
    attempt_number: number;
    created_at: string;
  }[],
  lesson: Lesson | undefined
): typeof results {
  if (!lesson) return results;
  const lessonWords = new Set(lesson.items.map((item) => item.text));
  return results.filter((r) => lessonWords.has(r.word));
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl &&
      supabaseKey &&
      supabaseUrl !== "https://placeholder.supabase.co";

    if (!canConnect) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionIdParam = req.nextUrl.searchParams.get("sessionId");
    const groupParam = req.nextUrl.searchParams.get("group");

    const lesson = groupParam ? findLesson(groupParam) : undefined;

    let session: {
      id: string;
      total_attempts: number;
      passed_count: number;
      best_score: number;
      created_at: string;
    } | null = null;

    if (sessionIdParam) {
      // Explicit sessionId — fetch that session (must be owned by this user).
      const { data: owned, error: ownedError } = await supabase
        .from("practice_sessions")
        .select("id, total_attempts, passed_count, best_score, created_at")
        .eq("id", sessionIdParam)
        .eq("user_id", user.id)
        .maybeSingle();

      if (ownedError) {
        console.error("Session ownership check error:", ownedError);
        return NextResponse.json(
          { error: "Failed to fetch session" },
          { status: 500 }
        );
      }
      session = owned;
    }

    // ponytail: fetch recent logs first, then optionally scope to session.
    // This avoids the old bug where a session-less fetch scoped to a
    // newly-created session returned empty results.
    let query = supabase
      .from("practice_logs")
      .select(
        "id, word_id, visual_score, audio_score, total_score, attempt_number, created_at, words!inner(word, viseme_group)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (sessionIdParam && session) {
      query = query.eq("session_id", session.id);
    }

    const { data: logs, error: logsError } = await query;

    // ponytail: hosted DB may predate migration 003 (no practice_logs.session_id),
    // so a scoped query fails (42703: column does not exist; PGRST204: schema
    // cache); fall back to unscoped recent logs.
    if (
      logsError &&
      sessionIdParam &&
      (logsError.code === "PGRST204" || logsError.code === "42703")
    ) {
      const { data: unscoped, error: unscopedError } = await supabase
        .from("practice_logs")
        .select(
          "id, word_id, visual_score, audio_score, total_score, attempt_number, created_at, words!inner(word, viseme_group)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (unscopedError) {
        console.error("Logs fetch error:", unscopedError);
        return NextResponse.json(
          { error: "Failed to fetch session logs" },
          { status: 500 }
        );
      }
      const results = dedupeByBestScore(
        (unscoped || []).map((log: any) => ({
          word: log.words.word,
          phonetic: log.words.phonetic || log.words.viseme_group,
          viseme_group: log.words.viseme_group,
          visual_score: log.visual_score,
          audio_score: log.audio_score,
          total_score: log.total_score,
          attempt_number: log.attempt_number,
          created_at: log.created_at,
        }))
      );

      const filteredResults = filterByLesson(results, lesson);
      return NextResponse.json({ session, results: filteredResults });
    }

    if (logsError) {
      console.error("Logs fetch error:", logsError);
      return NextResponse.json(
        { error: "Failed to fetch session logs" },
        { status: 500 }
      );
    }

    const results = dedupeByBestScore(
      (logs || []).map((log: any) => ({
        word: log.words.word,
        phonetic: log.words.phonetic || log.words.viseme_group,
        viseme_group: log.words.viseme_group,
        visual_score: log.visual_score,
        audio_score: log.audio_score,
        total_score: log.total_score,
        attempt_number: log.attempt_number,
        created_at: log.created_at,
      }))
    );

    const filteredResults = filterByLesson(results, lesson);
    return NextResponse.json({ session, results: filteredResults });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { totalAttempts, passedCount, bestScore } = await req.json();

    if (totalAttempts == null) {
      return NextResponse.json(
        { error: "Missing required field: totalAttempts" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl &&
      supabaseKey &&
      supabaseUrl !== "https://placeholder.supabase.co";

    if (!canConnect) {
      return NextResponse.json({ id: null });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .insert({
        user_id: user.id,
        total_attempts: totalAttempts,
        passed_count: passedCount,
        best_score: bestScore,
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, totalAttempts, passedCount, bestScore } =
      await req.json();

    if (!sessionId || totalAttempts == null) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, totalAttempts" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl &&
      supabaseKey &&
      supabaseUrl !== "https://placeholder.supabase.co";

    if (!canConnect) {
      return NextResponse.json({ id: null });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("practice_sessions")
      .update({
        total_attempts: totalAttempts,
        passed_count: passedCount,
        best_score: bestScore,
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ id: data?.id ?? null });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
