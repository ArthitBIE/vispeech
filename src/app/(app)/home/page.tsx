"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Play, Volume2, Home as HomeIcon, Flame, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Word {
  id: string;
  text: string;
  visemeGroup: string;
  difficulty: number;
}

interface Lesson {
  group: string;
  count: number;
}

const STREAK = 2;
const STREAK_GOAL = 10;

type Filter = "all" | "learning" | "done" | "not-started";

export default function HomePage() {
  const [words, setWords] = useState<Word[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      if (!isSupabaseConfigured || !supabase?.auth) {
        setLoading(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/words", { headers });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { words } = await res.json();
      setWords(words as Word[]);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  const lessons = useMemo(() => {
    const byGroup = new Map<string, Word[]>();
    for (const w of words) {
      const arr = byGroup.get(w.visemeGroup) ?? [];
      arr.push(w);
      byGroup.set(w.visemeGroup, arr);
    }
    return Array.from(byGroup.entries()).map(([group, items]) => ({
      group,
      count: items.length,
    }));
  }, [words]);

  const filteredLessons = useMemo(() => {
    let list = lessons;
    if (filter === "learning" || filter === "done") list = [];
    if (search.trim()) {
      list = list.filter((l) => l.group.includes(search.trim()));
    }
    return list;
  }, [lessons, filter, search]);

  const filterCounts = useMemo(
    () => ({
      all: lessons.length,
      learning: 0,
      done: 0,
      "not-started": lessons.length,
    }),
    [lessons],
  );

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: `ทั้งหมด (${filterCounts.all})` },
    { key: "learning", label: `กำลังเรียน (${filterCounts.learning})` },
    { key: "done", label: `เสร็จแล้ว (${filterCounts.done})` },
    { key: "not-started", label: `ยังไม่เริ่ม (${filterCounts["not-started"]})` },
  ];

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-muted-foreground">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ
          NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
        </p>
        <Button asChild>
          <Link href="/auth">ไปหน้าเข้าสู่ระบบ</Link>
        </Button>
      </div>
    );
  }

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
                    ต่อเนื่อง {STREAK} วันแล้ว!
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    เริ่มตั้งแต่ อาทิตย์ที่ 5 ก.ค. 2569
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4">
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-orange-400"
                    style={{ width: `${(STREAK / STREAK_GOAL) * 100}%` }}
                  />
                </div>
                <p className="text-base font-medium text-foreground">
                  {STREAK}/{STREAK_GOAL}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-foreground">แนะนำการฝึกวันนี้</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-semibold text-foreground">
                  {lessons[0]?.group ?? "คำศัพท์ง่าย"} บทที่ 1
                </span>
                <Button asChild className="h-8 rounded-md bg-foreground px-4 text-xs font-bold text-background hover:bg-foreground/90">
                  <Link href="/practice/session">
                    <Play className="mr-2 h-3 w-3 fill-current" />
                    เริ่มการฝึก
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="h-40 w-40 rounded-xl bg-muted" />
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
            <h2 className="text-lg font-bold text-foreground">บทเรียนทั้งหมด</h2>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse rounded-2xl border border-border shadow-none">
                  <CardContent className="p-4">
                    <div className="mb-4 h-32 rounded-lg bg-muted" />
                    <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
                    <div className="mb-1 h-4 w-1/3 rounded bg-muted" />
                    <div className="mt-4 mb-2 h-10 rounded bg-muted" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-14 rounded-lg bg-muted" />
                      <div className="h-14 rounded-lg bg-muted" />
                    </div>
                    <div className="mt-5 h-10 w-full rounded-lg bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
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
                  key={lesson.group}
                  className="rounded-2xl border border-border shadow-none"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-4 h-32 overflow-hidden rounded-lg bg-muted">
                      <div className="absolute bottom-2 right-4 h-16 w-16 rounded-full bg-muted-foreground/20" />
                    </div>

                    <h3 className="text-lg font-bold leading-tight text-foreground">
                      {lesson.group}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      บทที่ 1
                    </p>

                    <p className="mt-4 min-h-10 text-sm leading-5 text-muted-foreground">
                      ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน
                      พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground">คำศัพท์</p>
                        <p className="mt-1 text-xl font-bold text-foreground">
                          {lesson.count}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted px-4 py-3 text-center">
                        <p className="text-xs text-muted-foreground">การฝึก</p>
                        <p className="mt-1 text-xl font-bold text-muted-foreground">-</p>
                      </div>
                    </div>

                    <Button asChild className="mt-5 h-10 w-full rounded-lg bg-foreground text-sm font-bold text-background hover:bg-foreground/90">
                      <Link href="/practice/session">
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
