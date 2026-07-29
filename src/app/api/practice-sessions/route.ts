import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { totalAttempts, passedCount, bestScore } = await req.json();

    if (totalAttempts == null) {
      return NextResponse.json(
        { error: "Missing required field: totalAttempts" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl && supabaseKey && supabaseUrl !== "https://placeholder.supabase.co";

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

    const { data: { user } } = await supabase.auth.getUser();
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
      { status: 500 },
    );
  }
}
