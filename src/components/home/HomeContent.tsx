"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Play,
  Volume2,
  Home as HomeIcon,
  Flame,
  Sparkles,
} from "lucide-react";
import { STREAK_GOAL, PASS_THRESHOLD } from "@/lib/constants";
import { thaiFullDate } from "@/lib/streak";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LESSONS, lessonHref, type Lesson } from "@/lib/lesson";

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

type Filter = "all" | "learning" | "done" | "not-started";

interface HomeContentProps {
  words: Word[];
  accuracy: Record<string, WordAccuracy>;
  streakInfo: StreakInfo;
}

export default function HomeContent({
  words,
  accuracy,
  streakInfo,
}: HomeContentProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const lessons = useMemo((): Lesson[] => LESSONS, []);

  const wordByText = useMemo(() => {
    const m = new Map<string, Word>();
    for (const w of words) m.set(w.text, w);
    return m;
  }, [words]);

  const groupStatus = useMemo(() => {
    const status = new Map<string, "learning" | "done" | "not-started">();

    for (const lesson of lessons) {
      const lessonWords = lesson.items
        .map((item) => wordByText.get(item.text))
        .filter((w): w is Word => !!w);
      const wordsWithAccuracy = lessonWords.filter((w) => accuracy[w.id]);

      if (wordsWithAccuracy.length === 0) {
        status.set(lesson.id, "not-started");
      } else {
        const allDone = wordsWithAccuracy.every(
          (w) => accuracy[w.id]!.average_score >= PASS_THRESHOLD
        );
        if (allDone && wordsWithAccuracy.length === lessonWords.length) {
          status.set(lesson.id, "done");
        } else {
          status.set(lesson.id, "learning");
        }
      }
    }

    return status;
  }, [lessons, wordByText, accuracy]);

  const filteredLessons = useMemo(() => {
    let list = lessons;
    if (filter !== "all") {
      list = list.filter((l) => groupStatus.get(l.id) === filter);
    }
    if (search.trim()) {
      list = list.filter((l) => l.name.includes(search.trim()));
    }
    return list;
  }, [lessons, filter, search, groupStatus]);

  const filterCounts = useMemo(() => {
    const counts = { learning: 0, done: 0, "not-started": 0 };
    for (const status of groupStatus.values()) {
      counts[status]++;
    }

    return {
      all: lessons.length,
      learning: counts.learning,
      done: counts.done,
      "not-started": counts["not-started"],
    };
  }, [lessons, groupStatus]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `ทั้งหมด (${filterCounts.all})` },
    { key: "learning", label: `กำลังเรียน (${filterCounts.learning})` },
    { key: "done", label: `เสร็จแล้ว (${filterCounts.done})` },
    {
      key: "not-started",
      label: `ยังไม่เริ่ม (${filterCounts["not-started"]})`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-foreground" />
            <h1 className="text-lg font-bold text-foreground">หน้าหลัก</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกบทเรียนที่อยากฝึกวันนี้เลย
          </p>
        </div>

        <section className="mb-7 max-w-3xl rounded-xl border border-orange-300 bg-card p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="text-orange-500">
                  <Flame className="h-9 w-9 fill-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    ต่อเนื่อง {streakInfo.streak} วันแล้ว!
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {streakInfo.startDate
                      ? `เริ่มตั้งแต่ ${thaiFullDate(streakInfo.startDate)}`
                      : "ยังไม่ได้เริ่มฝึก"}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4">
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{
                      width: `${Math.min(100, (streakInfo.streak / STREAK_GOAL) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-base font-medium text-foreground">
                  {streakInfo.streak}/{STREAK_GOAL}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-foreground">
                  แนะนำการฝึกวันนี้
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-foreground">
                  {LESSONS[0].name} บทที่ 1
                </span>
                <Button
                  asChild
                  className="h-8 rounded-md bg-foreground px-4 text-xs font-bold text-background hover:bg-foreground/90"
                >
                  <Link href={lessonHref(LESSONS[0].id)}>
                    <Play className="mr-2 h-3 w-3 fill-current" />
                    เริ่มการฝึก
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <Image
                src="/mascot/image 6.webp"
                alt="Banner mascot"
                width={160}
                height={160}
                className="h-40 w-40 rounded-xl"
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3">
              {filters.map((f) => (
                <Badge
                  key={f.key}
                  className={
                    filter === f.key
                      ? "cursor-pointer rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground"
                      : "cursor-pointer rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                  }
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </Badge>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="ค้นหาบทเรียน"
                className="h-9 rounded-md border-border pr-9 text-sm placeholder:text-muted-foreground"
              />
              <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              บทเรียนทั้งหมด
            </h2>
          </div>

          {filteredLessons.length === 0 ? (
            <Card className="rounded-2xl border border-border shadow-none">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">ยังไม่มีบทเรียนในระบบ</p>
                <Button asChild variant="outline" className="mt-6">
                  <Link href="/practice/session">เริ่มฝึกฝนแทน</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="rounded-2xl border border-border shadow-none"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-4 h-32 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src="/mascot/image 7.webp"
                        alt="Lesson mascot"
                        width={64}
                        height={64}
                        className="absolute bottom-2 right-4 h-16 w-16 rounded-full"
                      />
                    </div>

                    <h3 className="text-lg font-bold leading-tight text-foreground">
                      {lesson.name}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      {lesson.items.length} คำศัพท์
                    </p>

                    <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
                      ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ
                      Feedback ทันทีทุกครั้งที่พูด
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground">คำศัพท์</p>
                        <p className="mt-1 text-xl font-bold text-foreground">
                          {lesson.items.length}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground">การฝึก</p>
                        <p className="mt-1 text-xl font-bold text-muted-foreground">
                          -
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="mt-5 h-10 w-full rounded-lg bg-foreground text-sm font-bold text-background hover:bg-foreground/90"
                    >
                      <Link href={lessonHref(lesson.id)}>
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        เริ่มการฝึก
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
