import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const canConnect =
      supabaseUrl && supabaseKey && supabaseUrl !== "https://placeholder.supabase.co";

    if (!canConnect) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { searchParams } = req.nextUrl;
    const group = searchParams.get("group")?.trim() || "";
    const search = searchParams.get("search")?.trim() || "";

    let query = supabase
      .from("words")
      .select("id, word, viseme_group, difficulty")
      .order("difficulty");

    if (group) {
      query = query.eq("viseme_group", group);
    }

    if (search) {
      query = query.ilike("word", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Words fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch words" },
        { status: 500 },
      );
    }

    const words = (data || []).map((row: any) => ({
      id: row.id,
      text: row.word,
      visemeGroup: row.viseme_group,
      difficulty: row.difficulty,
    }));

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Words fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 },
    );
  }
}
