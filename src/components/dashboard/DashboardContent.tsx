"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PASS_THRESHOLD } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WordResult } from "@/components/practice/PracticeResultSidebar";
import { BarChart3, Play, RotateCcw, Star, AlertTriangle } from "lucide-react";
import { LESSONS, lessonHref } from "@/lib/lesson";

const PracticeResultSidebar = dynamic(
  () => import("@/components/practice/PracticeResultSidebar"),
  { ssr: false }
);

// ── Types ──────────────────────────────────────────────

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

interface LessonItem {
  group: string;
  title: string;
  chapter: string;
  description: string;
  progressText: string;
  progressWidth: string;
  completed: boolean;
  highlighted: boolean;
  accuracy?: string;
  warning?: string;
  lessonWords: Word[];
}

interface DashboardContentProps {
  words: Word[];
  accuracy: Record<string, WordAccuracy>;
}

// ── LessonCard ─────────────────────────────────────────

function LessonCard({
  item,
  onSummaryClick,
  priority = false,
}: {
  item: LessonItem;
  onSummaryClick: () => void;
  priority?: boolean;
}) {
  const router = useRouter();

  return (
    <Card
      padded={false}
      className={
        item.highlighted
          ? "relative overflow-visible rounded-2xl border border-foreground shadow-none"
          : "relative overflow-hidden rounded-2xl border border-border shadow-none"
      }
    >
      {item.highlighted && (
        <div className="absolute -right-1 -top-3 text-orange-500">
          <AlertTriangle className="h-5 w-5 fill-orange-500 text-orange-500" />
        </div>
      )}

      <CardContent className="relative min-h-48 p-6">
        <div className="relative z-10 max-w-md">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={
                item.highlighted
                  ? "text-lg font-bold text-foreground"
                  : "text-lg font-bold text-muted-foreground"
              }
            >
              {item.title}
            </h2>
            <span className="font-bold text-muted-foreground">·</span>
            <p
              className={
                item.highlighted
                  ? "text-lg font-bold text-foreground"
                  : "text-lg font-bold text-muted-foreground"
              }
            >
              {item.chapter}
            </p>
          </div>

          <p className="mt-2 max-w-sm text-sm leading-5 text-muted-foreground">
            {item.description}
          </p>

          <p
            className={
              item.highlighted
                ? "mt-4 text-sm font-bold text-foreground"
                : "mt-4 text-sm font-bold text-muted-foreground"
            }
          >
            {item.progressText}
          </p>

          <div className="mt-3 h-5 max-w-sm overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{ width: item.progressWidth }}
            />
          </div>

          {item.completed ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {item.accuracy && (
                <Badge
                  variant="secondary"
                  className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-100"
                >
                  <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {item.accuracy}
                </Badge>
              )}

              {item.warning && (
                <Badge
                  variant="secondary"
                  className="rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                >
                  <AlertTriangle className="mr-1 h-3 w-3 fill-orange-500 text-orange-500" />
                  {item.warning}
                </Badge>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4">
            {item.completed ? (
              <>
                <Button
                  className="h-8 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                  onClick={onSummaryClick}
                >
                  <BarChart3 className="mr-2 h-3 w-3" />
                  สรุปผล
                </Button>

                <Button
                  variant="ghost"
                  className="h-8 px-0 text-xs font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => router.push(lessonHref(item.group))}
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  เริ่มการฝึกซ้ำ
                </Button>
              </>
            ) : (
              <Button
                className="h-8 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                onClick={() => router.push(lessonHref(item.group))}
              >
                <Play className="mr-2 h-3 w-3 fill-primary-foreground" />
                เริ่มการฝึก
              </Button>
            )}
          </div>
        </div>

        {/* Decorative illustration circle */}
        <Image
          src={item.completed ? "/mascot/image 8.png" : "/mascot/image 9.png"}
          alt={item.completed ? "Lesson complete mascot" : "Lesson mascot"}
          width={112}
          height={112}
          priority={priority}
          className={
            item.highlighted
              ? "absolute bottom-4 right-8 h-28 w-28 rounded-full"
              : "absolute bottom-4 right-8 h-28 w-28 rounded-full opacity-60"
          }
        />
      </CardContent>
    </Card>
  );
}

// ── Content (client) ───────────────────────────────────

export default function DashboardContent({
  words: initialWords,
  accuracy: initialAccuracy,
}: DashboardContentProps) {
  const router = useRouter();

  // ── Sidebar state ──────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarResults, setSidebarResults] = useState<WordResult[]>([]);
  const [sidebarAccuracy, setSidebarAccuracy] = useState(0);
  const [sidebarGroup, setSidebarGroup] = useState("");

  // Map raw practice_logs to WordResult[]
  function mapResultsToWordResults(
    results: {
      word: string;
      phonetic?: string;
      total_score: number;
      visual_score?: number;
      audio_score?: number;
    }[]
  ): WordResult[] {
    const seen = new Set<string>();
    return results
      .filter((r) => {
        if (seen.has(r.word)) return false;
        seen.add(r.word);
        return true;
      })
      .map((r) => ({
        word: r.word,
        phonetic: r.phonetic,
        score: r.total_score,
        status:
          r.total_score >= PASS_THRESHOLD ? "success" : ("warning" as const),
        expanded: r.total_score < PASS_THRESHOLD,
        lipFeedback:
          (r.visual_score ?? 0) >= PASS_THRESHOLD
            ? "ถูกต้อง"
            : `ปากกว้างไม่พอ (${r.visual_score ?? 0}%)`,
        soundFeedback:
          (r.audio_score ?? 0) >= PASS_THRESHOLD
            ? "ถูกต้อง"
            : `ระดับเสียงไม่ถูกต้อง (${r.audio_score ?? 0}%)`,
        recommendation:
          r.total_score >= PASS_THRESHOLD
            ? undefined
            : "ลองอ้าปากกว้างขึ้นให้เห็นฟันบนเล็กน้อย",
      }));
  }

  // Auto-open sidebar with latest practice results on mount
  useEffect(() => {
    async function loadLatest() {
      try {
        if (!isSupabaseConfigured || !supabase?.auth) return;
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch("/api/practice-sessions", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) return;

        const { results } = await res.json();
        if (!results?.length) return;

        const mapped = mapResultsToWordResults(results);
        if (!mapped.length) return;

        setSidebarResults(mapped);
        setSidebarAccuracy(
          Math.round(mapped.reduce((s, r) => s + r.score, 0) / mapped.length)
        );
        setSidebarGroup("");
        setSidebarOpen(true);
      } catch {}
    }
    loadLatest();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSummaryClick(lessonWords: Word[], group: string) {
    try {
      if (!isSupabaseConfigured || !supabase?.auth) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      const res = await fetch("/api/practice-sessions", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;

      const { results } = await res.json();

      const lessonWordSet = new Set(lessonWords.map((w) => w.word));
      const filtered = (results || []).filter((r: any) =>
        lessonWordSet.has(r.word)
      );

      const mapped = mapResultsToWordResults(filtered);
      const avgAcc =
        mapped.length > 0
          ? Math.round(mapped.reduce((s, r) => s + r.score, 0) / mapped.length)
          : 0;

      setSidebarResults(mapped);
      setSidebarAccuracy(avgAcc);
      setSidebarGroup(group);
      setSidebarOpen(true);
    } catch (err) {
      console.error("Summary fetch error:", err);
    }
  }

  // Build lesson items from static LESSONS; progress computed from
  // DB-backed items (text match). Non-DB items count toward total but
  // never toward completion, so they show "0 / N".
  const realLessonItems = useMemo((): LessonItem[] => {
    const wordByText = new Map<string, Word>();
    for (const w of initialWords) wordByText.set(w.word, w);

    const description =
      "ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันที";

    return LESSONS.map((lesson) => {
      const lessonWords = lesson.items
        .map((item) => wordByText.get(item.text))
        .filter((w): w is Word => !!w);
      const totalWords = lesson.items.length;

      const completedWords = lessonWords.filter(
        (w) => initialAccuracy[w.id]
      ).length;
      const completed = completedWords > 0;
      const progressWidth =
        totalWords > 0
          ? `${Math.round((completedWords / totalWords) * 100)}%`
          : "0%";

      // Average accuracy for this lesson
      const accValues = lessonWords
        .map((w) => initialAccuracy[w.id])
        .filter((a): a is WordAccuracy => !!a);
      const avgAccuracy =
        accValues.length > 0
          ? Math.round(
              accValues.reduce((s, a) => s + a.average_score, 0) /
                accValues.length
            )
          : 0;

      // Words needing improvement (score < PASS_THRESHOLD)
      const needingPractice = lessonWords.filter((w) => {
        const a = initialAccuracy[w.id];
        return a && a.average_score < PASS_THRESHOLD;
      });
      const highlighted = needingPractice.length > 0;

      const progressText = completedWords
        ? `${completedWords} / ${totalWords} คำ`
        : `0 / ${totalWords} คำ`;

      return {
        group: lesson.id,
        title: lesson.name,
        chapter: "บทที่ 1",
        description,
        progressText,
        progressWidth,
        completed,
        highlighted,
        accuracy: avgAccuracy > 0 ? `${avgAccuracy}%` : undefined,
        warning:
          needingPractice.length > 0
            ? `มี ${needingPractice.length} คำที่ควรฝึกเพิ่ม`
            : undefined,
        lessonWords,
      };
    });
  }, [initialWords, initialAccuracy]);

  // ── Render ──────────────────────────────────────

  if (realLessonItems.length === 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-foreground" />
          <h1 className="text-lg font-bold text-foreground">
            ความก้าวหน้าทั้งหมด
          </h1>
        </div>
        <Card className="rounded-2xl border border-border shadow-none">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">ยังไม่มีบทเรียนในระบบ</p>
            <p className="mt-2 text-sm text-muted-foreground">
              โปรดเพิ่มข้อมูลคำศัพท์ในฐานข้อมูล Supabase
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-foreground" />
        <h1 className="text-lg font-bold text-foreground">
          ความก้าวหน้าทั้งหมด
        </h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {realLessonItems.map((item, index) => (
          <LessonCard
            key={item.title}
            item={item}
            priority={index === 0}
            onSummaryClick={() =>
              handleSummaryClick(item.lessonWords, item.group)
            }
          />
        ))}
      </div>

      {/* Results sidebar */}
      <PracticeResultSidebar
        results={sidebarResults}
        totalAccuracy={sidebarAccuracy}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRestart={(group) => router.push(lessonHref(group))}
        group={sidebarGroup}
      />
    </div>
  );
}
