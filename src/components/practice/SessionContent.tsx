"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import dynamic from "next/dynamic";
import type {
  WordRow,
  ScoreResult,
  LiveState,
} from "@/components/practice/PracticeWord";

const PracticeWord = dynamic(
  () =>
    import("@/components/practice/PracticeWord").then((m) => m.PracticeWord),
  { ssr: false }
);
import { Bot, ChevronLeft, Info, Smile, Volume2 } from "lucide-react";
import { AppBreadcrumb } from "@/components/layout/AppBreadcrumb";
import { LESSONS, findLesson } from "@/lib/lesson";

interface PracticeWordResult extends WordRow {
  score: number;
  status: "success" | "warning";
  expanded: boolean;
  lipFeedback: string;
  soundFeedback: string;
  recommendation?: string;
  visualScore: number;
  audioScore: number;
}

interface SessionContentProps {
  words: WordRow[];
  group: string;
}

export default function SessionContent({ words, group }: SessionContentProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<PracticeWordResult[]>([]);
  const [avatarLetter, setAvatarLetter] = useState("ก");
  const [live, setLive] = useState<LiveState>({
    mouthOpen: 0,
    audioLevel: 0,
    transcript: "",
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const mascotImage = "/mascot/image 2.webp";
  // ponytail: swap to "/mascot/image 4.png" when trigger decided

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

        // Create practice session up-front
        if (authSession?.access_token) {
          const sessionRes = await fetch("/api/practice-sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authSession.access_token}`,
            },
            body: JSON.stringify({
              totalAttempts: 0,
              passedCount: 0,
              bestScore: 0,
            }),
          });
          if (sessionRes.ok) {
            const { id } = await sessionRes.json();
            if (!cancelled) setSessionId(id);
          }
        }
      } catch {
        // session creation is best-effort; practice still works without it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lesson = findLesson(group) ?? LESSONS[0];
  // all lesson items are difficulty 1
  const filteredWords = words.filter((w) => w.difficulty === 1);

  function currentWord() {
    return filteredWords[currentIndex];
  }

  function handleScored(score: ScoreResult) {
    setTotalAttempts((prev) => prev + 1);
    const word = currentWord();
    const result: PracticeWordResult = {
      ...word,
      score: score.total_score,
      status: score.total_score >= 75 ? "success" : "warning",
      expanded: score.total_score < 75,
      lipFeedback:
        score.visual_score >= 75
          ? "ถูกต้อง"
          : `ปากกว้างไม่พอ (${score.visual_score}%)`,
      soundFeedback:
        score.audio_score >= 75
          ? "ถูกต้อง"
          : `ระดับเสียงไม่ถูกต้อง (${score.audio_score}%)`,
      recommendation:
        score.total_score < 75
          ? "ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย"
          : undefined,
      visualScore: score.visual_score,
      audioScore: score.audio_score,
    };

    setResults((prev) => {
      const existing = prev.findIndex((r) => r.id === word.id);
      if (existing >= 0) {
        return prev.map((r, i) => (i === existing ? result : r));
      }
      return [...prev, result];
    });
  }

  function handleSkip() {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setLive({ mouthOpen: 0, audioLevel: 0, transcript: "" });
    } else {
      handleFinish();
    }
  }

  async function handleFinish() {
    if (!sessionId) {
      router.push("/dashboard");
      return;
    }
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // totalAttempts: use state counter (actual attempts, not unique words)
        const passedCount = results.filter(
          (r) => r.status === "success"
        ).length;
        const bestScore =
          results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

        await fetch("/api/practice-sessions", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            sessionId,
            totalAttempts,
            passedCount,
            bestScore,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to update session:", err);
    }

    router.push(`/summary?sessionId=${sessionId}`);
  }

  function handleCancel() {
    router.push("/dashboard");
  }

  if (filteredWords.length === 0) {
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
        <AppBreadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Lesson", href: "/home" },
            { label: "Practice" },
          ]}
        />

        <div className="grid min-h-[700px] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[230px_1fr_230px]">
          {/* --- Word list sidebar --- */}
          <aside className="border-b border-neutral-200 bg-white p-5 lg:border-b-0 lg:border-r">
            <div>
              <h1 className="text-base font-bold">บทเรียน {lesson.name}</h1>

              <div className="mt-4 flex gap-2">
                {filteredWords.map((_, i) => {
                  const completed = results.find(
                    (r) => r.word === filteredWords[i].word
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
                คำที่ {currentIndex + 1} / {filteredWords.length}
              </p>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <section>
              <h2 className="text-sm font-bold">คำในบทนี้</h2>

              <div className="mt-4 space-y-3">
                {filteredWords.map((word, i) => {
                  const completed = results.find((r) => r.word === word.word);
                  const scoreDisplay = completed ? `${completed.score}%` : "-";
                  const statusIcon = !completed
                    ? "/practice-session/not-practice-yet.svg"
                    : completed.score >= 100
                      ? "/practice-session/full-score-word.svg"
                      : "/practice-session/score-above-0.svg";
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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={statusIcon} alt="" className="h-3 w-3" />
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
          </aside>

          {/* --- Practice card --- */}
          <section className="bg-white p-5 lg:p-7">
            <PracticeWord
              key={filteredWords[currentIndex]?.id}
              word={filteredWords[currentIndex]}
              sessionId={sessionId}
              onScored={handleScored}
              onSkip={handleSkip}
              onLive={setLive}
              isLast={currentIndex === filteredWords.length - 1}
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

            <p
              aria-live="polite"
              data-testid="practice-transcript"
              className="min-h-10 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700"
            >
              {live.transcript || "กำลังรอเสียง ..."}
            </p>

            <div className="mt-16">
              <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4 text-center text-sm font-semibold leading-5 shadow-sm">
                {currentIndex === 0
                  ? "เริ่มต้นกัน! คำแรก"
                  : currentIndex === Math.floor(filteredWords.length / 2)
                    ? `ครึ่งทางแล้ว! คำที่ ${currentIndex + 1}`
                    : currentIndex === filteredWords.length - 1
                      ? "คำสุดท้าย! ตั้งใจอีกนิด"
                      : `คำที่ ${currentIndex + 1} จาก ${filteredWords.length}`}
                <br />
                หายใจลึกๆ แล้วค่อยๆ พูดนะ
              </div>

              <Image
                src={mascotImage}
                alt="Pakky mascot"
                width={128}
                height={128}
                priority
                className="mx-auto mt-8 h-32 w-32 object-bottom"
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
