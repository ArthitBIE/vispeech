"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { PracticeWord, type WordRow } from "@/components/practice/PracticeWord";
import { Button } from "@/components/ui/button";

export default function PracticePage() {
  const params = useParams<{ word: string }>();
  const router = useRouter();
  const [wordData, setWordData] = useState<WordRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const decodedWord = decodeURIComponent(params.word);
        const { data, error } = await supabase
          ?.from("words")
          .select("*")
          .eq("word", decodedWord)
          .single();

        if (cancelled) return;
        if (error || !data) {
          setError("ไม่พบคำนี้");
          return;
        }
        setWordData(data);
      } catch {
        if (cancelled) return;
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.word]);

  function handleScored() {
    // Score already saved via API in PracticeWord
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  if (error && !wordData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          กลับไปหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  if (!wordData) return null;

  return (
    <PracticeWord word={wordData} onScored={handleScored} onSkip={handleSkip} />
  );
}
