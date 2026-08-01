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

    const { searchParams } = req.nextUrl;
    const group = searchParams.get("group")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";
    const difficulty = searchParams.get("difficulty")?.trim() || "";

    let query = supabase
      .from("words")
      .select("id, word, viseme_group, difficulty, phonetic")
      .order("difficulty");

    if (group) {
      query = query.eq("viseme_group", group);
    }

    if (search) {
      query = query.ilike("word", `%${search}%`);
    }

    if (difficulty) {
      const diff = parseInt(difficulty, 10);
      if (!isNaN(diff)) {
        query = query.lte("difficulty", diff);
      }
    }

    const { data, error } = await query;

    if (error) {
      // phonetic column may not exist yet (migration 003 not applied) — retry without it
      const fallback = await supabase
        .from("words")
        .select("id, word, viseme_group, difficulty")
        .order("difficulty");
      const data2 = fallback.data;
      if (fallback.error || !data2) {
        console.error("Words fetch error:", error);
        return NextResponse.json(
          { error: "Failed to fetch words" },
          { status: 500 }
        );
      }
      const words2 = (data2 || []).map(
        (row: {
          id: string;
          word: string;
          viseme_group: string;
          difficulty: number;
        }) => ({
          id: row.id,
          text: row.word,
          visemeGroup: row.viseme_group,
          difficulty: row.difficulty,
          phonetic: null,
        })
      );
      return NextResponse.json({ words: words2 });
    }

    const words = (data || []).map(
      (row: {
        id: string;
        word: string;
        viseme_group: string;
        difficulty: number;
        phonetic: string | null;
      }) => ({
        id: row.id,
        text: row.word,
        visemeGroup: row.viseme_group,
        difficulty: row.difficulty,
        phonetic: row.phonetic,
      })
    );

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}
