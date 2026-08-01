"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PracticeWord,
  type WordRow,
  type ScoreResult,
} from "@/components/practice/PracticeWord";
import PracticeResultSidebar, {
  type WordResult,
} from "@/components/practice/PracticeResultSidebar";

interface PracticeWordResult extends WordResult {
  wordId: string;
  visualScore: number;
  audioScore: number;
}

export default function PracticeSessionPage() {
  const router = useRouter();
  const [words, setWords] = useState<WordRow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeWordResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const headers: Record<string, string> = {};
        if (authSession?.access_token) {
          headers["Authorization"] = `Bearer ${authSession.access_token}`;
        }
        const res = await fetch("/api/words?difficulty=1", { headers });
        if (!res.ok) throw new Error("Failed to fetch words");
        const { words: wordsData } = await res.json();
        if (cancelled) return;
        if (!wordsData || wordsData.length === 0) {
          setError("ไม่พบคำศัพท์ในระดับนี้");
          return;
        }
        setWords(
          (
            wordsData as {
              id: string;
              text: string;
              visemeGroup: string;
              difficulty?: number;
            }[]
          ).map((w) => ({
            id: w.id,
            word: w.text,
            viseme_group: w.visemeGroup,
            difficulty: w.difficulty ?? 0,
          }))
        );
      } catch {
        if (cancelled) return;
        setError("เกิดข้อผิดพลาดในการโหลดคำศัพท์");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function currentWord() {
    return words[currentIndex];
  }

  function handleScored(score: ScoreResult) {
    const word = currentWord();
    const result: PracticeWordResult = {
      word: word.word,
      phonetic: word.viseme_group,
      score: score.total_score,
      status: score.total_score >= 70 ? "success" : "warning",
      expanded: score.total_score < 70,
      lipFeedback:
        score.visual_score >= 70
          ? "ถูกต้อง"
          : `ปากกว้างไม่พอ (${score.visual_score}%)`,
      soundFeedback:
        score.audio_score >= 70
          ? "ถูกต้อง"
          : `ระดับเสียงไม่ถูกต้อง (${score.audio_score}%)`,
      recommendation:
        score.total_score < 70
          ? "ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย"
          : undefined,
      wordId: word.id,
      visualScore: score.visual_score,
      audioScore: score.audio_score,
    };

    setResults((prev) => {
      const existing = prev.findIndex((r) => r.wordId === word.id);
      if (existing >= 0) {
        return prev.map((r, i) => (i === existing ? result : r));
      }
      return [...prev, result];
    });
  }

  function handleSkip() {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    // Create practice session record
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const totalAttempts = results.length;
        const passedCount = results.filter(
          (r) => r.status === "success"
        ).length;
        const bestScore =
          results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

        await fetch("/api/practice-sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ totalAttempts, passedCount, bestScore }),
        });
      }
    } catch (err) {
      console.error("Failed to save session:", err);
    }

    setShowResults(true);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setResults([]);
    setShowResults(false);
  }

  function handleClose() {
    router.push("/summary");
  }

  function totalAccuracy() {
    if (results.length === 0) return 0;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return avg;
  }

  function progressPercent() {
    if (words.length === 0) return 0;
    return ((currentIndex + 1) / words.length) * 100;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลดบทเรียน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          กลับหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">ยังไม่มีคำศัพท์ในบทนี้</p>
        <Button onClick={() => router.push("/dashboard")}>
          กลับหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid min-h-[700px] gap-8 overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[230px_1fr_230px]">
          {/* --- Word list sidebar --- */}
          <aside className="bg-card p-6 lg:p-8">
            <div>
              <h1 className="text-base font-bold text-foreground">
                บทเรียน คำศัพท์ง่าย
              </h1>

              <div className="mt-4 flex gap-2">
                {words.map((_, i) => {
                  const completed = results.find(
                    (r) => r.word === words[i].word
                  );
                  const dotColor = completed
                    ? "bg-emerald-500"
                    : i === currentIndex
                      ? "bg-foreground"
                      : "bg-muted-foreground/20";
                  return (
                    <div key={i} className={`h-3 w-3 rounded-sm ${dotColor}`} />
                  );
                })}
              </div>

              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                คำที่ {currentIndex + 1} / {words.length}
              </p>
            </div>

            <div className="my-6 border-t border-border" />

            <section>
              <h2 className="text-sm font-bold text-foreground">คำในบทนี้</h2>

              <div className="mt-4 space-y-3">
                {words.map((word, i) => {
                  const completed = results.find((r) => r.word === word.word);
                  const scoreDisplay = completed
                    ? `${completed.score}%`
                    : i < currentIndex
                      ? "-"
                      : i === currentIndex
                        ? "กำลังฝึก"
                        : "-";
                  const colorClass =
                    completed?.status === "warning"
                      ? "text-orange-500"
                      : completed?.status === "success"
                        ? "text-emerald-500"
                        : "text-muted-foreground";
                  return (
                    <div
                      key={word.id}
                      className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}
                    >
                      <span>◎</span>
                      <span>{word.word}</span>
                      <span>{scoreDisplay}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="my-6 border-t border-border" />

            <section>
              <h2 className="text-sm font-bold text-foreground">ความยาก</h2>

              <div className="mt-4 flex gap-2">
                {[0, 1].map((item) => (
                  <span
                    key={item}
                    className="h-4 w-4 rounded-full border border-orange-400"
                  />
                ))}
                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="h-4 w-4 rounded-full border border-foreground/60"
                  />
                ))}
              </div>
            </section>
          </aside>

          {/* --- Practice card --- */}
          <section className="bg-card p-6 lg:p-8">
            <PracticeWord
              word={currentWord()}
              onScored={handleScored}
              onSkip={handleSkip}
            />
          </section>

          {/* --- Tips sidebar --- */}
          <aside className="bg-card p-6 lg:p-8">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-5 w-5 text-primary">💡</span>
                <h2 className="text-base font-bold text-foreground">
                  Tips การฝึก
                </h2>
              </div>

              <Card className="rounded-lg border border-border shadow-none">
                <CardContent className="p-4">
                  <ul className="ml-5 list-disc space-y-2 text-sm leading-5 text-foreground">
                    <li>ยิ้มกว้างถึงข้าง</li>
                    <li>ลิ้นยกสูงด้านหน้าชนเพดาน</li>
                    <li>ฟันเผยอเล็กน้อย</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="h-4 w-4">🎤</span>
                  <span>เสียง</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={progressPercent()} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {Math.round(progressPercent())}%
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className="h-4 w-4">👄</span>
                  <span>คำที่ฝึกแล้ว</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress
                    value={
                      words.length > 0
                        ? (results.length / words.length) * 100
                        : 0
                    }
                    className="h-2 flex-1"
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {results.length} / {words.length}
                  </span>
                </div>
              </div>
            </section>

            <div className="my-8 border-t border-border" />

            <div className="rounded-lg border border-border bg-card px-4 py-4 text-center text-sm font-semibold leading-5 text-foreground shadow-sm">
              {currentIndex === 0
                ? "เริ่มต้นกัน! คำแรก"
                : currentIndex === Math.floor(words.length / 2)
                  ? `ครึ่งทางแล้ว! คำที่ ${currentIndex + 1}`
                  : currentIndex === words.length - 1
                    ? "คำสุดท้าย! ตั้งใจอีกนิด"
                    : `คำที่ ${currentIndex + 1} จาก ${words.length}`}
              <br />
              หายใจลึกๆ แล้วค่อยๆ พูดนะ
            </div>

            <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
              <div className="h-24 w-24 rounded-full bg-muted-foreground/20" />
            </div>
          </aside>
        </div>
      </div>

      <PracticeResultSidebar
        results={results}
        totalAccuracy={totalAccuracy()}
        open={showResults}
        onClose={handleClose}
        onRestart={handleRestart}
      />
    </div>
  );
}
