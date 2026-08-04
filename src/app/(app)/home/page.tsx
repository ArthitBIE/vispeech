import { createServerClient } from "@/lib/supabase/server";
import { computeStreak, dateKey } from "@/lib/streak";
import HomeContent from "@/components/home/HomeContent";

interface Word {
  id: string;
  text: string;
  visemeGroup: string;
  difficulty: number;
  phonetic: string | null;
}

interface WordAccuracy {
  word_id: string;
  best_score: number;
  average_score: number;
  total_attempts: number;
  last_practiced_at: string;
}

interface StreakInfo {
  streak: number;
  startDate: Date | null;
}

async function fetchHomeData() {
  const supabase = await createServerClient();
  if (!supabase) {
    return {
      words: [] as Word[],
      accuracy: {} as Record<string, WordAccuracy>,
      streakInfo: { streak: 0, startDate: null as Date | null },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      words: [] as Word[],
      accuracy: {} as Record<string, WordAccuracy>,
      streakInfo: { streak: 0, startDate: null as Date | null },
    };
  }

  // Parallel fetch: words, word_accuracy, practice_logs
  const [wordsRes, accRes, logsRes] = await Promise.all([
    supabase
      .from("words")
      .select("id, word, viseme_group, difficulty, phonetic")
      .order("difficulty"),
    supabase.from("word_accuracy").select("*").eq("user_id", user.id),
    supabase.from("practice_logs").select("created_at").eq("user_id", user.id),
  ]);

  const words: Word[] = (wordsRes.data || []).map(
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

  const keys = (logsRes.data || []).map((l: { created_at: string }) =>
    dateKey(new Date(l.created_at))
  );
  const { streak, startDate } = computeStreak(keys);

  return { words, accuracy, streakInfo: { streak, startDate } };
}

export default async function HomePage() {
  const { words, accuracy, streakInfo } = await fetchHomeData();

  return (
    <HomeContent words={words} accuracy={accuracy} streakInfo={streakInfo} />
  );
}
