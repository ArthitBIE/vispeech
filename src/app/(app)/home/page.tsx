"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Play, Sparkles, Flame } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Word {
  id: string;
  text: string;
  visemeGroup: string;
  difficulty: number;
}

const STREAK = 2; // ponytail: stubbed until streak table exists
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
      // ponytail: leave empty, show empty state
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
    // ponytail: no progress source yet -> treat all as "not-started"
    if (filter === "learning" || filter === "done") list = [];
    if (search.trim()) {
      list = list.filter((l) => l.group.includes(search.trim()));
    }
    return list;
  }, [lessons, filter, search]);

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-muted-foreground">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
        </p>
        <Button asChild>
          <Link href="/auth">ไปหน้าเข้าสู่ระบบ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero Header */}
      <header className="space-y-3">
        <h1 className="text-balance text-3xl font-bold text-foreground">
          ฝึกออกเสียงไพเราะ
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          เลือกบทเรียนที่อยากฝึกวันนี้ หรือดูความก้าวหน้าของคุณที่แดชบอร์ด
        </p>
      </header>

      {/* Streak & Quick Start - Asymmetric */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card variant="elevated" className="relative overflow-hidden lg:col-span-2">
          <div className="noise-bg absolute inset-0 opacity-30" />
          <div className="relative flex items-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10">
              <Flame className="h-10 w-10 text-brand" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">ต่อเนื่อง {STREAK} วันแล้ว!</h2>
              <div className="mt-3 flex items-baseline gap-4">
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-brand transition-all duration-500"
                      style={{ width: `${(STREAK / STREAK_GOAL) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {STREAK}/{STREAK_GOAL}
                </span>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/practice/session">
                <Play className="h-3.5 w-3.5 fill-current" />
                เริ่มการฝึก
              </Link>
            </Button>
          </div>
        </Card>

        <Card variant="surface" padded={false} className="flex items-center justify-center p-6">
          <div className="text-center">
            <Sparkles className="mx-auto h-8 w-8 text-brand" />
            <p className="mt-2 text-sm">
              แนะนำวันนี้<span className="mx-1.5 text-muted-foreground">·</span>
              <span className="font-medium">{lessons[0]?.group ?? "คำศัพท์ง่าย"}</span>
            </p>
          </div>
        </Card>
      </section>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({lessons.length})</TabsTrigger>
            <TabsTrigger value="learning">กำลังเรียน</TabsTrigger>
            <TabsTrigger value="done">เสร็จแล้ว</TabsTrigger>
            <TabsTrigger value="not-started">ยังไม่เริ่ม</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาบทเรียน..."
            className="pl-9 sm:w-64"
          />
        </div>
      </div>

      {/* Lessons Grid - Asymmetric 2-col */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} variant="elevated" className="h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <Card variant="ghost" className="py-20 text-center">
          <p className="text-muted-foreground">ยังไม่มีบทเรียนในระบบ</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/practice/session">เริ่มฝึกฝนแทน</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredLessons.map((lesson, idx) => (
            <Card
              key={lesson.group}
              variant={idx % 3 === 0 ? "elevated" : "surface"}
              interactive
              className="flex flex-col"
            >
              <div className="relative mb-4 h-36 overflow-hidden rounded-lg bg-muted">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(lesson.group)}/400/180`}
                  alt=""
                  className="h-full w-full object-cover opacity-60 blur-[1px]"
                />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🦊
                </div>
              </div>
              <h4 className="text-base font-bold">บทเรียน: {lesson.group}</h4>
              <Badge variant="secondary" className="mt-1 w-fit">
                ระดับ 1
              </Badge>
              <p className="mt-3 text-xs text-muted-foreground">
                ฝึกออกเสียงคำที่ใช้บ่อย พร้อม Feedback ทันที
              </p>

              <div className="mt-auto pt-4">
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">คำ</p>
                    <p className="text-xl font-bold">{lesson.count}</p>
                  </div>
                  <div className="rounded-lg bg-muted py-2 text-center">
                    <p className="text-[10px] text-muted-foreground">การฝึก</p>
                    <p className="text-xl font-bold">-</p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/practice/session">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    เริ่มการฝึก
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}