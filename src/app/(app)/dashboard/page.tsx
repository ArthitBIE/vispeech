"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PASS_THRESHOLD } from "@/lib/constants";
import { SupabaseNotConfigured } from "@/components/SupabaseNotConfigured";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Play, RotateCcw, Star, AlertTriangle } from "lucide-react";

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

// ── LessonItem (what each card renders) ────────────────

interface LessonItem {
  title: string;
  chapter: string;
  description: string;
  progressText: string;
  progressWidth: string;
  completed: boolean;
  highlighted: boolean;
  accuracy?: string;
  warning?: string;
}

// ── Skeleton ───────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div className="h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 xl:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative min-h-48 animate-pulse rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-3 h-5 w-32 rounded bg-muted" />
            <div className="mb-6 h-4 w-64 rounded bg-muted" />
            <div className="mb-2 h-4 w-20 rounded bg-muted" />
            <div className="h-5 w-full rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LessonCard ─────────────────────────────────────────

function LessonCard({ item }: { item: LessonItem }) {
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
                  onClick={() => router.push("/summary")}
                >
                  <BarChart3 className="mr-2 h-3 w-3" />
                  สรุปผล
                </Button>

                <Button
                  variant="ghost"
                  className="h-8 px-0 text-xs font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => router.push("/practice/session")}
                >
                  <RotateCcw className="mr-2 h-3 w-3" />
                  เริ่มการฝึกซ้ำ
                </Button>
              </>
            ) : (
              <Button
                className="h-8 rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                onClick={() => router.push("/practice/session")}
              >
                <Play className="mr-2 h-3 w-3 fill-primary-foreground" />
                เริ่มการฝึก
              </Button>
            )}
          </div>
        </div>

        {/* Decorative illustration circle */}
        <div
          className={
            item.highlighted
              ? "absolute bottom-4 right-8 h-28 w-28 rounded-full bg-muted"
              : "absolute bottom-4 right-8 h-28 w-28 rounded-full bg-muted opacity-60"
          }
        />

        {item.highlighted && (
          <div className="absolute bottom-8 right-14 h-24 w-32 rounded-xl border border-dashed border-muted-foreground/30 opacity-60" />
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [accuracy, setAccuracy] = useState<Record<string, WordAccuracy>>({});
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      if (!isSupabaseConfigured || !supabase?.auth) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/signin");
        return;
      }

      // Fetch words via API, fallback to direct supabase query
      let fetchedWords: Word[] = [];
      try {
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        const res = await fetch("/api/words", { headers });
        if (res.ok) {
          const { words: apiWords } = await res.json();
          fetchedWords = (apiWords || []).map(
            (w: {
              id: string;
              text: string;
              visemeGroup: string;
              difficulty?: number;
            }) => ({
              id: w.id,
              word: w.text,
              viseme_group: w.visemeGroup,
              difficulty: w.difficulty ?? 0,
            })
          );
        }
      } catch (e) {
        console.warn("API words failed, querying supabase directly:", e);
        const { data } = await supabase
          .from("words")
          .select("id, word, viseme_group, difficulty");
        fetchedWords = (data || []).map(
          (w: {
            id: string;
            word: string;
            viseme_group: string;
            difficulty?: number;
          }) => ({
            id: w.id,
            word: w.word,
            viseme_group: w.viseme_group,
            difficulty: w.difficulty ?? 0,
          })
        );
      }

      setWords(fetchedWords);

      // Fetch word accuracy
      const { data: accData } = await supabase
        .from("word_accuracy")
        .select("*")
        .eq("user_id", session.user.id);

      const accMap: Record<string, WordAccuracy> = {};
      (accData || []).forEach(
        (a: {
          word_id: string;
          best_score: number;
          average_score: number;
          total_attempts: number;
          last_practiced_at: string;
        }) => {
          accMap[a.word_id] = {
            word_id: a.word_id,
            best_score: a.best_score,
            average_score: a.average_score,
            total_attempts: a.total_attempts,
            last_practiced_at: a.last_practiced_at,
          };
        }
      );
      setAccuracy(accMap);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await loadData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build lesson items from real Supabase data (data-driven from viseme_group)
  const realLessonItems = useMemo((): LessonItem[] => {
    if (words.length === 0) return [];

    // Get distinct viseme_groups from words
    const groups = Array.from(new Set(words.map((w) => w.viseme_group))).sort();

    const groupDescriptions: Record<string, string> = {
      ริมฝีปากปิด:
        "ฝึกออกเสียงคำที่มีริมฝีปากปิด พร้อมรูปปากและ Feedback ทันที",
      ปากเปิดกว้าง:
        "ฝึกออกเสียงคำที่ปากเปิดกว้าง พร้อมรูปปากและ Feedback ทันที",
      ปากห่อกลม: "ฝึกออกเสียงคำที่ปากห่อกลม พร้อมรูปปากและ Feedback ทันที",
      ฟันแตะริมฝีปาก:
        "ฝึกออกเสียงคำที่ฟันแตะริมฝีปาก พร้อมรูปปากและ Feedback ทันที",
      ปากเปิดกลาง: "ฝึกออกเสียงคำที่ปากเปิดกลาง พร้อมรูปปากและ Feedback ทันที",
      ทักทาย: "ฝึกออกเสียงคำทักทายที่ใช้บ่อย พร้อมรูปปากและ Feedback ทันที",
      ตัวเลข: "ฝึกออกเสียงตัวเลขไทย พร้อมรูปปากและ Feedback ทันที",
    };

    const items = groups.map((group) => {
      const lessonWords = words.filter((w) => w.viseme_group === group);
      const totalWords = lessonWords.length;

      const completedWords = lessonWords.filter((w) => accuracy[w.id]).length;
      const completed = completedWords > 0;
      const progressWidth =
        totalWords > 0
          ? `${Math.round((completedWords / totalWords) * 100)}%`
          : "0%";

      // Average accuracy for this lesson type
      const accValues = lessonWords
        .map((w) => accuracy[w.id])
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
        const a = accuracy[w.id];
        return a && a.average_score < PASS_THRESHOLD;
      });
      const highlighted = needingPractice.length > 0;

      const progressText = completedWords
        ? `${completedWords} / ${totalWords} คำ`
        : `0 / ${totalWords} คำ`;

      return {
        title: group,
        chapter: "บทที่ 1",
        description:
          groupDescriptions[group] ??
          `ฝึกออกเสียงคำในกลุ่ม ${group} พร้อมรูปปากและ Feedback ทันที`,
        progressText,
        progressWidth,
        completed,
        highlighted,
        accuracy: avgAccuracy > 0 ? `${avgAccuracy}%` : undefined,
        warning:
          needingPractice.length > 0
            ? `มี ${needingPractice.length} คำที่ควรฝึกเพิ่ม`
            : undefined,
      };
    });

    return items;
  }, [words, accuracy]);

  const displayItems = realLessonItems;

  // ── Render ──────────────────────────────────────

  if (!isSupabaseConfigured) {
    return <SupabaseNotConfigured ctaHref="/auth/signin" />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (displayItems.length === 0) {
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
        {displayItems.map((item) => (
          <LessonCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}
