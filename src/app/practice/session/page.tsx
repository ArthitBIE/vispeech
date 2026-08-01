"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  PracticeWord,
  type WordRow,
  type ScoreResult,
  type LiveState,
} from "@/components/practice/PracticeWord";
import PracticeResultSidebar, {
  type WordResult,
} from "@/components/practice/PracticeResultSidebar";
import { Bot, ChevronLeft, Home, Info, Smile, Volume2 } from "lucide-react";

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
  const [avatarLetter, setAvatarLetter] = useState("ก");
  const [live, setLive] = useState<LiveState>({
    mouthOpen: 0,
    audioLevel: 0,
    transcript: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        if (!cancelled && authSession?.user?.email) {
          setAvatarLetter(authSession.user.email[0].toUpperCase());
        }
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
              phonetic?: string;
            }[]
          ).map((w) => ({
            id: w.id,
            word: w.text,
            viseme_group: w.visemeGroup,
            difficulty: w.difficulty ?? 0,
            phonetic: w.phonetic,
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
      phonetic: word.phonetic ?? word.viseme_group,
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
      setLive({ mouthOpen: 0, audioLevel: 0, transcript: "" });
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
    setLive({ mouthOpen: 0, audioLevel: 0, transcript: "" });
  }

  function handleClose() {
    router.push("/summary");
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  function totalAccuracy() {
    if (results.length === 0) return 0;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return avg;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">กำลังโหลดบทเรียน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
        <p className="text-neutral-500">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          กลับหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
        <p className="text-neutral-500">ยังไม่มีคำศัพท์ในบทนี้</p>
        <Button onClick={() => router.push("/dashboard")}>
          กลับหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-black font-sans">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="h-9 px-0 text-base font-medium text-red-500 hover:bg-transparent hover:text-red-600"
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            ยกเลิกการฝึก
          </Button>

          <button
            type="button"
            aria-label="Open profile menu"
            className="h-8 w-8 overflow-hidden rounded-full bg-neutral-300 ring-1 ring-neutral-200"
          >
            <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-xs font-semibold text-neutral-600">
              {avatarLetter}
            </div>
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <nav className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Home className="h-5 w-5 text-neutral-400" />
          <span>Dashboard</span>
          <span>/</span>
          <span>Lesson</span>
          <span>/</span>
          <span className="text-black">Practice</span>
        </nav>

        <div className="grid min-h-[700px] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[230px_1fr_230px]">
          {/* --- Word list sidebar --- */}
          <aside className="border-b border-neutral-200 bg-white p-5 lg:border-b-0 lg:border-r">
            <div>
              <h1 className="text-base font-bold">บทเรียน คำศัพท์ง่าย</h1>

              <div className="mt-4 flex gap-2">
                {words.map((_, i) => {
                  const completed = results.find(
                    (r) => r.word === words[i].word
                  );
                  return (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-sm ${
                        completed ? "bg-emerald-500" : "bg-neutral-300"
                      }`}
                    />
                  );
                })}
              </div>

              <p className="mt-4 text-sm font-semibold text-neutral-300">
                คำที่ {currentIndex + 1} / {words.length}
              </p>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <section>
              <h2 className="text-sm font-bold">คำในบทนี้</h2>

              <div className="mt-4 space-y-3">
                {words.map((word, i) => {
                  const completed = results.find((r) => r.word === word.word);
                  const scoreDisplay = completed ? `${completed.score}%` : "-";
                  const colorClass =
                    completed?.status === "warning"
                      ? "text-orange-500"
                      : completed?.status === "success"
                        ? "text-emerald-500"
                        : i === currentIndex
                          ? "text-neutral-700"
                          : "text-neutral-300";
                  return (
                    <div
                      key={word.id}
                      className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}
                    >
                      <span>◎</span>
                      <span>
                        {word.word}
                        {word.phonetic ? ` ${word.phonetic}` : ""}
                      </span>
                      <span>{scoreDisplay}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="my-6 border-t border-neutral-200" />

            <section>
              <h2 className="text-sm font-bold">ความยาก</h2>

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
                    className="h-4 w-4 rounded-full border border-neutral-900"
                  />
                ))}
              </div>
            </section>
          </aside>

          {/* --- Practice card --- */}
          <section className="bg-white p-5 lg:p-7">
            <PracticeWord
              word={currentWord()}
              onScored={handleScored}
              onSkip={handleSkip}
              onLive={setLive}
            />
          </section>

          {/* --- Tips sidebar --- */}
          <aside className="border-t border-neutral-200 bg-white p-5 lg:border-l lg:border-t-0">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h2 className="text-base font-bold">Tips จาก Pakky</h2>
              </div>

              <Card className="rounded-lg border border-neutral-200 shadow-none">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                    <Info className="h-4 w-4" />
                    <span>Tips การออกเสียง</span>
                  </div>

                  <ul className="ml-5 list-disc space-y-2 text-sm leading-5 text-black">
                    <li>ยิ้มกว้างถึงข้าง</li>
                    <li>ลิ้นยกสูงด้านหน้าชนเพดาน</li>
                    <li>ฟันเผยอเล็กน้อย</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Volume2 className="h-4 w-4" />
                  <span>ระดับเสียง</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={live.audioLevel} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-neutral-400">
                    {live.audioLevel}%
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Smile className="h-4 w-4" />
                  <span>ริมฝีปาก</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={live.mouthOpen} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-neutral-400">
                    {live.mouthOpen}%
                  </span>
                </div>
              </div>
            </section>

            <div className="my-8 border-t border-neutral-200" />

            <Input
              readOnly
              value={live.transcript || "กำลังรอเสียง ..."}
              data-testid="practice-transcript"
              className="h-10 rounded-lg border-neutral-200 text-sm text-neutral-400"
            />

            <div className="mt-16">
              <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4 text-center text-sm font-semibold leading-5 shadow-sm">
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

              <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-neutral-100">
                <div className="h-24 w-24 rounded-full bg-neutral-300" />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <PracticeResultSidebar
        results={results}
        totalAccuracy={totalAccuracy()}
        open={showResults}
        onClose={handleClose}
        onRestart={handleRestart}
      />
    </main>
  );
}
