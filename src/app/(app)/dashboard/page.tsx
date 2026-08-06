import { getSupabaseUser } from "@/lib/supabase/server";
import DashboardContent from "@/components/dashboard/DashboardContent";

interface Word {
  id: string;
  word: string;
  viseme_group: string;
  difficulty: number;
}

interface WordAccuracy {
  word_id: string;
  best_score: number;
  average_score: number;
  total_attempts: number;
  last_practiced_at: string;
}

async function fetchDashboardData() {
  const { supabase, user } = await getSupabaseUser();
  if (!supabase || !user) {
    return { words: [], accuracy: {} };
  }

  const [wordsRes, accRes] = await Promise.all([
    supabase
      .from("words")
      .select("id, word, viseme_group, difficulty")
      .order("difficulty"),
    supabase.from("word_accuracy").select("*").eq("user_id", user.id),
  ]);

  const words: Word[] = (wordsRes.data || []).map(
    (w: {
      id: string;
      word: string;
      viseme_group: string;
      difficulty: number;
    }) => ({
      id: w.id,
      word: w.word,
      viseme_group: w.viseme_group,
      difficulty: w.difficulty ?? 0,
    })
  );

  const accuracy: Record<string, WordAccuracy> = {};
  (accRes.data || []).forEach(
    (a: {
      word_id: string;
      best_score: number;
      average_score: number;
      total_attempts: number;
      last_practiced_at: string;
    }) => {
      accuracy[a.word_id] = {
        word_id: a.word_id,
        best_score: a.best_score,
        average_score: a.average_score,
        total_attempts: a.total_attempts,
        last_practiced_at: a.last_practiced_at,
      };
    }
  );

  return { words, accuracy };
}

export default async function DashboardPage() {
  const { words, accuracy } = await fetchDashboardData();

  return <DashboardContent words={words} accuracy={accuracy} />;
}
