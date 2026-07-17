"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Play, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-bold">หน้าหลัก</h1>
        <p className="text-sm text-muted-foreground">เลือกบทเรียนที่อยากฝึกวันนี้เลย</p>
      </div>

      <Card className="border-brand/40">
        <div className="flex flex-wrap items-center gap-6 p-6">
          <span className="text-4xl">🔥</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold">ต่อเนื่อง {STREAK} วันแล้ว!</h2>
            <div className="mt-3 flex items-center gap-4">
              <Progress value={(STREAK / STREAK_GOAL) * 100} className="h-2 w-full max-w-sm" />
              <span className="text-sm font-medium tabular-nums">
                {STREAK}/{STREAK_GOAL}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="hidden h-5 w-5 text-brand sm:block" />
            <p className="hidden text-sm font-semibold sm:block">
              แนะนำวันนี้
              <span className="mx-2 text-muted-foreground">·</span>
              {lessons[0]?.group ?? "คำศัพท์ง่าย"}
            </p>
            <Button asChild>
              <Link href="/practice/session">
                <Play className="h-3.5 w-3.5 fill-current" />
                เริ่มการฝึก
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({lessons.length})</TabsTrigger>
            <TabsTrigger value="learning">กำลังเรียน</TabsTrigger>
            <TabsTrigger value="done">เสร็จแล้ว</TabsTrigger>
            <TabsTrigger value="not-started">ยังไม่เริ่ม</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-64">
          <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาบทเรียน"
            className="pr-9"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : filteredLessons.length === 0 ? (
        <p className="text-muted-foreground">ยังไม่มีบทเรียนในระบบ</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLessons.map((lesson) => (
            <Card key={lesson.group} className="flex flex-col p-4">
              <div className="relative mb-4 h-[135px] overflow-hidden rounded-lg bg-muted">
                <div className="absolute bottom-2 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-background text-muted-foreground">
                  🦊
                </div>
              </div>
              <h4 className="text-base font-bold">{lesson.group}</h4>
              <Badge variant="secondary" className="mt-1 w-fit">
                บทที่ 1
              </Badge>
              <p className="mt-3 min-h-[44px] text-xs leading-snug text-muted-foreground">
                ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted py-3 text-center">
                  <p className="text-[10px] text-muted-foreground">คำ</p>
                  <p className="text-2xl font-bold">{lesson.count}</p>
                </div>
                <div className="rounded-lg bg-muted py-3 text-center">
                  <p className="text-[10px] text-muted-foreground">การฝึก</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
              <Button asChild className="mt-5 w-full">
                <Link href="/practice/session">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  เริ่มการฝึก
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
