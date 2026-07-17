"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Volume2,
  AudioLines,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LogRow {
  word: string;
  phonetic: string;
  total_score: number;
  visual_score: number;
  audio_score: number;
}

const MOCK: LogRow[] = [
  { word: "ยา", phonetic: "/jaː/", total_score: 100, visual_score: 98, audio_score: 100 },
  { word: "ฝา", phonetic: "/faː/", total_score: 72, visual_score: 65, audio_score: 78 },
  { word: "ดี", phonetic: "/diː/", total_score: 88, visual_score: 90, audio_score: 85 },
  { word: "มี", phonetic: "/miː/", total_score: 65, visual_score: 60, audio_score: 70 },
  { word: "ดู", phonetic: "/duː/", total_score: 98, visual_score: 97, audio_score: 99 },
];

export default function SummaryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase!.auth.getSession();
      if (session) {
        const { data } = await supabase!
          .from("practice_logs")
          .select("*, words(word)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data && data.length) {
          setRows(
            data.map((d: any) => ({
              word: d.words?.word ?? d.word ?? "—",
              phonetic: "",
              total_score: d.total_score,
              visual_score: d.visual_score,
              audio_score: d.audio_score,
            })),
          );
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  const list = rows.length ? rows : MOCK;
  const avg =
    list.reduce((s, r) => s + r.total_score, 0) / (list.length || 1);
  const stars = Math.round(avg / 20);

  return (
    <div className="mx-auto w-full max-w-[1195px]">
      {/* Breadcrumb / actions */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">แดชบอร์ด</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">บทเรียน</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">ฝึกฝน</span>
          <span className="text-border">/</span>
          <span className="font-bold">สรุปผล</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/practice/session")}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            เริ่มการฝึกซ้ำ
          </button>
          <Button size="sm" onClick={() => router.push("/home")}>
            กลับหน้าหลัก
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="min-h-[920px]">
        {/* Hero */}
        <div className="flex flex-col items-center pt-10 text-center">
          <Avatar className="h-[210px] w-[210px] rounded-full bg-muted">
            <AvatarFallback className="bg-primary/10 text-5xl text-primary">🦊</AvatarFallback>
          </Avatar>
          <h1 className="mt-8 text-lg font-semibold leading-snug">
            เยี่ยมมากเลย!<br />
            ฝึกครบทุกคำแล้ววันนี้เก่งมาก!
          </h1>
          <p className="mt-6 text-base font-semibold">บทเรียนคำศัพท์ง่าย</p>
          <div className="mt-4 flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className={`h-6 w-6 ${
                  i < stars ? "fill-[#ffb000] text-[#ffb000]" : "text-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div className="mx-auto mt-12 w-[1085px] max-w-[92%] overflow-hidden rounded-xl bg-muted">
          <div className="border-b border-border px-6 py-5">
            <h2 className="text-lg font-bold">ผลการฝึกแต่ละคำ</h2>
          </div>

          <div className="px-6 py-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
            ) : (
              <div className="space-y-3">
                {list.map((item, i) => {
                  const passed = item.total_score >= 70;
                  return (
                    <Collapsible key={`${item.word}-${i}`}>
                      <div className="flex h-9 items-center justify-between rounded-lg bg-card px-4">
                        <div className="flex items-center gap-3">
                          {passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 fill-[#ff8a00] text-[#ff8a00]" />
                          )}
                          <span className="text-sm font-semibold">{item.word}</span>
                          <span className="text-[13px] text-muted-foreground">
                            {item.phonetic}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={passed ? "default" : "secondary"}>
                            {item.total_score}%
                          </Badge>
                          <CollapsibleTrigger asChild>
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-90" />
                          </CollapsibleTrigger>
                        </div>
                      </div>

                      <CollapsibleContent className="rounded-b-lg bg-card px-5 pb-6 pt-4">
                        <div className="space-y-5 text-sm">
                          <div className="flex items-center gap-3">
                            <Volume2 className="h-5 w-5" />
                            <span className="font-bold">ริมฝีปาก</span>
                            <span>:</span>
                            {/* ponytail: feedback_th not stored yet */}
                            <span className="font-medium text-[#ff7a00]">
                              {passed ? "ถูกต้อง" : "ปากกว้างไม่พอ"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <AudioLines className="h-5 w-5" />
                            <span className="font-bold">ระดับเสียง</span>
                            <span>:</span>
                            <span className="font-medium text-emerald-500">ถูกต้อง</span>
                          </div>
                          <div className="flex items-center gap-3 text-[#ff7a00]">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-medium">
                              ภาพ {item.visual_score} | เสียง {item.audio_score} | รวม {item.total_score}
                            </span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
