"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Camera,
  Smile,
  Bot,
  Info,
  Volume2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import PracticeResultSidebar, {
  type WordResult,
} from "@/components/practice/PracticeResultSidebar";

const wordData = [
  {
    label: "ยา /ja:/",
    word: "ยา",
    phonetic: "/ja:/",
    visualScore: 100,
    audioScore: 100,
  },
  {
    label: "ฝา /fa:/",
    word: "ฝา",
    phonetic: "/fa:/",
    visualScore: 75,
    audioScore: 65,
  },
  {
    label: "ดี /di:/",
    word: "ดี",
    phonetic: "/dee:/",
    visualScore: 90,
    audioScore: 83,
  },
  {
    label: "มี /me:/",
    word: "มี",
    phonetic: "/me:/",
    visualScore: 60,
    audioScore: 75,
  },
  {
    label: "ดู /du:/",
    word: "ดู",
    phonetic: "/du:/",
    visualScore: 100,
    audioScore: 100,
  },
];

export default function PracticePage() {
  const router = useRouter();
  const [currentWordIndex, setCurrentWordIndex] = useState(2);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentWord = wordData[currentWordIndex];

  const initialScores = useMemo(() => {
    const map: Record<string, string> = {};
    wordData.forEach((w, i) => {
      if (i < 2) {
        const total = w.visualScore * 0.7 + w.audioScore * 0.3;
        map[w.word] = total >= 70 ? "text-emerald-500" : "text-orange-500";
      } else {
        map[w.word] =
          i === currentWordIndex ? "text-foreground" : "text-muted-foreground";
      }
    });
    return map;
  }, [currentWordIndex]);

  const buildResultFromWord = (word: (typeof wordData)[0]): WordResult => {
    const totalScore = Math.round(
      word.visualScore * 0.7 + word.audioScore * 0.3,
    );
    const status = totalScore >= 70 ? "success" : "warning";
    const lipFeedback =
      word.visualScore >= 70
        ? "ถูกต้อง"
        : `ปากกว้างไม่พอ (${word.visualScore}%)`;
    const soundFeedback =
      word.audioScore >= 70
        ? "ถูกต้อง"
        : `ระดับเสียงไม่ถูกต้อง (${word.audioScore}%)`;
    const recommendation =
      status === "warning"
        ? `ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย`
        : undefined;
    return {
      word: word.word,
      phonetic: word.phonetic,
      score: totalScore,
      status,
      expanded: status === "warning",
      lipFeedback,
      soundFeedback,
      recommendation,
    };
  };

  const handlePracticeWord = () => {
    const result = buildResultFromWord(currentWord);

    setWordResults((prev) => {
      const existing = prev.findIndex((r) => r.word === currentWord.word);
      if (existing >= 0) {
        return prev.map((r, i) => (i === existing ? result : r));
      }
      return [...prev, result];
    });

    if (currentWordIndex >= wordData.length - 1) {
      setShowResults(true);
    } else {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handleSkipWord = () => {
    if (currentWordIndex < wordData.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setWordResults([]);
    setShowResults(false);
  };

  const handleClose = () => {
    router.push("/summary");
  };

  const totalAccuracy = useMemo(() => {
    const resolved = wordData.map(
      (w) =>
        wordResults.find((r) => r.word === w.word) ?? buildResultFromWord(w),
    );
    const avg =
      resolved.reduce((sum, r) => sum + r.score, 0) / resolved.length;
    return avg;
  }, [wordResults, currentWordIndex]);

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
                {wordData.map((_, i) => {
                  const completed = wordResults.find(
                    (r) => r.word === wordData[i].word,
                  );
                  const dotColor = completed
                    ? "bg-emerald-500"
                    : i === currentWordIndex
                      ? "bg-foreground"
                      : "bg-muted-foreground/20";
                  return (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-sm ${dotColor}`}
                    />
                  );
                })}
              </div>

              <p className="mt-4 text-sm font-semibold text-muted-foreground">
                คำที่ {currentWordIndex + 1} / {wordData.length}
              </p>
            </div>

            <div className="my-6 border-t border-border" />

            <section>
              <h2 className="text-sm font-bold text-foreground">คำในบทนี้</h2>

              <div className="mt-4 space-y-3">
                {wordData.map((word, i) => {
                  const completed = wordResults.find(
                    (r) => r.word === word.word,
                  );
                  const scoreDisplay = completed
                    ? `${completed.score}%`
                    : i < 2
                      ? `${Math.round(word.visualScore * 0.7 + word.audioScore * 0.3)}%`
                      : "-";
                  const colorClass =
                    completed?.status === "warning"
                      ? "text-orange-500"
                      : completed?.status === "success"
                        ? "text-emerald-500"
                        : initialScores[word.word] ?? "text-muted-foreground";
                  return (
                    <div
                      key={word.label}
                      className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}
                    >
                      <span>◎</span>
                      <span>{word.label}</span>
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
            <Card className="mx-auto max-w-2xl rounded-xl border border-border shadow-none">
              <CardContent className="p-6 text-center">
                <h2 className="text-4xl font-bold leading-none text-foreground">
                  {currentWord.word}
                </h2>
                <p className="mt-2 text-lg font-medium text-muted-foreground">
                  {currentWord.phonetic}
                </p>
                <p className="mt-1 text-base font-medium text-muted-foreground">
                  Good / {currentWord.word}
                </p>

                <div className="mx-auto mt-4 flex h-5 w-44 items-center rounded border border-border bg-card px-2">
                  <Play className="h-3 w-3 fill-foreground text-foreground" />
                  <div className="mx-2 h-1 flex-1 rounded-full bg-muted">
                    <div className="h-1 w-1/5 rounded-full bg-foreground" />
                  </div>
                  <Volume2 className="h-3 w-3 text-foreground" />
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {/* Camera preview */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Camera className="h-4 w-4" />
                  <span>กล้อง</span>
                </div>

                <div className="flex h-56 items-center justify-center rounded-sm bg-muted text-center text-sm leading-5 text-muted-foreground">
                  <div>
                    <p>ยังไม่ได้เปิดกล้อง</p>
                    <p>กด &quot;เริ่มฝึก&quot; ด้านล่าง</p>
                  </div>
                </div>
              </div>

              {/* Lip preview */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Smile className="h-4 w-4" />
                  <span>ตัวอย่างริมฝีปาก</span>
                </div>

                <div className="flex h-56 items-center justify-center rounded-sm bg-muted">
                  <div className="relative h-44 w-36 rounded-b-full rounded-t-sm bg-card">
                    <div className="absolute left-1/2 top-10 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-2 border-border" />
                    <div className="absolute left-1/2 top-20 h-7 w-24 -translate-x-1/2 rounded-full bg-red-300">
                      <div className="absolute left-2 right-2 top-3 h-1 rounded-full bg-white" />
                      <div className="absolute bottom-2 left-3 right-3 h-px bg-red-700" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 h-4 w-8 -translate-x-1/2 rounded-t-full border-t border-border" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <Button
                className="h-10 rounded-lg bg-black px-5 text-sm font-bold text-white hover:bg-neutral-800"
                onClick={handlePracticeWord}
              >
                <Play className="mr-2 h-4 w-4 fill-white" />
                เริ่มการฝึกออกเสียง
              </Button>

              <Button
                variant="ghost"
                className="mt-3 h-8 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={handleSkipWord}
              >
                ข้ามคำ
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* --- Tips sidebar --- */}
          <aside className="bg-card p-6 lg:p-8">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h2 className="text-base font-bold text-foreground">
                  Tips จาก Pakky
                </h2>
              </div>

              <Card className="rounded-lg border border-border shadow-none">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                    <Info className="h-4 w-4" />
                    <span>Tips การออกเสียง</span>
                  </div>

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
                  <Volume2 className="h-4 w-4" />
                  <span>ระดับเสียง</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={30} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    30%
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                  <Smile className="h-4 w-4" />
                  <span>ริมฝีปาก</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={70} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground">
                    70%
                  </span>
                </div>
              </div>
            </section>

            <div className="my-8 border-t border-border" />

            <Input
              readOnly
              value="กำลังรอเสียง ..."
              className="h-10 rounded-lg border-border text-sm text-muted-foreground"
            />

            <div className="mt-16">
              <div className="rounded-lg border border-border bg-card px-4 py-4 text-center text-sm font-semibold leading-5 text-foreground shadow-sm">
                {currentWordIndex === 0
                  ? "เริ่มต้นกัน! คำแรก"
                  : currentWordIndex === Math.floor(wordData.length / 2)
                    ? `ครึ่งทางแล้ว! คำที่ ${currentWordIndex + 1}`
                    : currentWordIndex === wordData.length - 1
                      ? "คำสุดท้าย! ตั้งใจอีกนิด"
                      : `คำที่ ${currentWordIndex + 1} จาก ${wordData.length}`}
                <br />
                หายใจลึกๆ แล้วค่อยๆ พูดนะ
              </div>

              <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                <div className="h-24 w-24 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PracticeResultSidebar
        results={wordResults}
        totalAccuracy={totalAccuracy}
        open={showResults}
        onClose={handleClose}
        onRestart={handleRestart}
      />
    </div>
  );
}
