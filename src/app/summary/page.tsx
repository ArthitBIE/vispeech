"use client";

import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Volume2,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { PASS_THRESHOLD } from "@/lib/constants";
import { lessonHref, deriveLesson } from "@/lib/lesson";

interface SummaryResult {
  word: string;
  phonetic: string;
  viseme_group: string;
  visual_score: number;
  audio_score: number;
  total_score: number;
  attempt_number: number;
  created_at: string;
}

interface SummarySession {
  id: string;
  total_attempts: number;
  passed_count: number;
  best_score: number;
  created_at: string;
}

export default function SummarizePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          กำลังโหลดผลการฝึก...
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}

function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SummarySession | null>(null);
  const [results, setResults] = useState<SummaryResult[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const {
          data: { session: authSession },
        } = await supabase.auth.getSession();
        const qs = sessionIdParam
          ? `?sessionId=${encodeURIComponent(sessionIdParam)}`
          : "";
        const res = await fetch(`/api/practice-sessions${qs}`, {
          headers: {
            Authorization: `Bearer ${authSession?.access_token ?? ""}`,
          },
        });
        if (!res.ok) {
          setError("เกิดข้อผิดพลาดในการโหลดผลการฝึก");
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setSession(data.session);
        setResults(data.results);
        if (data.results.length > 0) {
          const initial = new Set<string>();
          data.results.forEach((r: SummaryResult) => {
            if (r.total_score < PASS_THRESHOLD) initial.add(r.word);
          });
          setExpanded(initial);
        }
      } catch {
        if (!cancelled) setError("เกิดข้อผิดพลาดในการโหลดผลการฝึก");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, [sessionIdParam]);

  const totalAccuracy =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.total_score, 0) / results.length
      : 0;

  const lesson = deriveLesson(results.map((r) => r.word));
  const practiceHref = lessonHref(lesson?.id ?? "");

  const toggleExpanded = (word: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        กำลังโหลดผลการฝึก...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-orange-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.push(practiceHref)}>
          เริ่มการฝึก
        </Button>
      </div>
    );
  }

  if (!session || results.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-16 text-center">
        <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <h1 className="text-lg font-bold text-foreground">ยังไม่มีผลการฝึก</h1>
        <p className="text-sm text-muted-foreground">
          เริ่มฝึกคำศัพท์เพื่อดูผลลัพธ์และความคืบหน้าของคุณ
        </p>
        <Button onClick={() => router.push(practiceHref)}>เริ่มการฝึก</Button>
      </div>
    );
  }

  // Star rating: 5 Stars: 90-100%, 4 Stars: 75-89%, 3 Stars: 60-74%, 2 Stars: 45-59%, 1 Star: 0-44%
  let starCount = 1;
  if (totalAccuracy >= 90) starCount = 5;
  else if (totalAccuracy >= 75) starCount = 4;
  else if (totalAccuracy >= 60) starCount = 3;
  else if (totalAccuracy >= 45) starCount = 2;

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="h-9 px-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
          onClick={() => router.push(practiceHref)}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          เริ่มการฝึกซ้ำ
        </Button>

        <Button
          asChild
          className="h-9 rounded-md bg-foreground px-4 text-sm font-bold text-background hover:bg-foreground/90"
        >
          <Link
            href={
              sessionIdParam
                ? `/dashboard?sessionId=${encodeURIComponent(sessionIdParam)}`
                : "/dashboard"
            }
          >
            กลับหน้าหลัก
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Completion section */}
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
        <CardContent className="p-0">
          <section className="flex flex-col items-center px-6 pt-10 pb-9 text-center">
            <Image
              src="/mascot/image 8.webp"
              alt="Completion mascot"
              width={176}
              height={176}
              priority
              className="mb-8 h-44 w-44 object-bottom"
            />

            <h1 className="text-lg font-bold leading-6 text-foreground">
              เยี่ยมมากเลย!
              <br />
              ฝึกครบทุกคำแล้ววันนี้เก่งมาก!
            </h1>

            <p className="mt-6 text-base font-medium text-muted-foreground">
              ความแม่นยำเฉลี่ย {totalAccuracy.toFixed(1)}%
            </p>

            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={
                    i <= starCount
                      ? "h-5 w-5 fill-yellow-400 text-yellow-400"
                      : "h-5 w-5 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
          </section>

          {/* Results section */}
          <section className="mx-auto mb-10 max-w-5xl px-6">
            <div className="overflow-hidden rounded-t-xl bg-muted">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-lg font-bold text-foreground">
                  ผลการฝึกแต่ละคำ
                </h2>
              </div>

              <div className="space-y-5 px-5 py-6">
                {results.map((item) => {
                  const isSuccess = item.total_score >= PASS_THRESHOLD;
                  const isOpen = expanded.has(item.word);
                  const lipFeedback =
                    item.visual_score >= PASS_THRESHOLD
                      ? "ถูกต้อง"
                      : `ปากกว้างไม่พอ (${item.visual_score}%)`;
                  const soundFeedback =
                    item.audio_score >= PASS_THRESHOLD
                      ? "ถูกต้อง"
                      : `ระดับเสียงไม่ถูกต้อง (${item.audio_score}%)`;
                  const recommendation = isSuccess
                    ? null
                    : "ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย";

                  return (
                    <div key={item.word}>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(item.word)}
                        className="flex h-9 w-full items-center justify-between bg-card px-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          {isSuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 fill-orange-500 text-orange-500" />
                          )}

                          <span className="text-sm font-semibold text-foreground">
                            {item.word}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.phonetic}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-foreground">
                            {item.total_score}%
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isOpen ? (
                        <div className="rounded-b-lg bg-card px-4 pb-5 pt-3">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Smile className="h-5 w-5 text-foreground" />
                              <span className="font-bold text-foreground">
                                ริมฝีปาก
                              </span>
                              <span className="text-muted-foreground">:</span>
                              <span
                                className={`font-medium ${
                                  item.visual_score >= PASS_THRESHOLD
                                    ? "text-emerald-500"
                                    : "text-orange-500"
                                }`}
                              >
                                {lipFeedback}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Volume2 className="h-5 w-5 text-foreground" />
                              <span className="font-bold text-foreground">
                                ระดับเสียง
                              </span>
                              <span className="text-muted-foreground">:</span>
                              <span
                                className={`font-medium ${
                                  item.audio_score >= PASS_THRESHOLD
                                    ? "text-emerald-500"
                                    : "text-orange-500"
                                }`}
                              >
                                {soundFeedback}
                              </span>
                            </div>

                            {recommendation ? (
                              <div className="flex flex-wrap items-center gap-3 text-sm text-orange-500">
                                <Sparkles className="h-5 w-5" />
                                <span className="font-medium">
                                  {recommendation}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
