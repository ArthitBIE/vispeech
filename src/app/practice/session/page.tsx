import { createServerClient } from "@/lib/supabase/server";
import { LESSONS, findLesson } from "@/lib/lesson";
import SessionContent from "@/components/practice/SessionContent";
import type { WordRow } from "@/components/practice/PracticeWord";

interface DbWord {
  id: string;
  word: string;
  viseme_group: string;
  difficulty: number;
  phonetic: string | null;
}

export default async function PracticeSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;

  const lesson = findLesson(group ?? "") ?? LESSONS[0];
  const supabase = await createServerClient();

  let words: WordRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("words")
      .select("id, word, viseme_group, difficulty, phonetic");

    const wordByText = new Map<string, DbWord>();
    ((data as DbWord[] | null) || []).forEach((w) => wordByText.set(w.word, w));

    // Map lesson items to real DB ids (so scores persist only for
    // DB-backed words); synthetic id when the word is not in the DB.
    words = lesson.items.map((item) => {
      const dbWord = wordByText.get(item.text);
      return {
        id: dbWord?.id ?? item.text,
        word: item.text,
        viseme_group: item.visemeGroup ?? dbWord?.viseme_group ?? "",
        difficulty: item.difficulty ?? 1,
        phonetic: item.phonetic ?? dbWord?.phonetic ?? "",
      };
    });
  }

  return <SessionContent words={words} group={lesson.id} />;
}
