import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Get latest practice session for this user
    const { data: session, error: sessionError } = await supabase
      .from("practice_sessions")
      .select("id, total_attempts, passed_count, best_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ session: null, results: [] });
    }

    // Get practice logs for this user with word details.
    // ponytail: hosted DB lacks practice_logs.session_id (migration 003 unapplied),
    // so logs are not session-scoped; return recent logs instead.
    const { data: logs, error: logsError } = await supabase
      .from("practice_logs")
      .select(
        "id, word_id, visual_score, audio_score, total_score, attempt_number, created_at, words!inner(word, viseme_group)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (logsError) {
      console.error("Logs fetch error:", logsError);
      return NextResponse.json(
        { error: "Failed to fetch session logs" },
        { status: 500 }
      );
    }

    const results = (logs || []).map((log: any) => ({
      word: log.words.word,
      phonetic: log.words.phonetic || log.words.viseme_group,
      viseme_group: log.words.viseme_group,
      visual_score: log.visual_score,
      audio_score: log.audio_score,
      total_score: log.total_score,
      attempt_number: log.attempt_number,
      created_at: log.created_at,
    }));

    return NextResponse.json({ session, results });
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
