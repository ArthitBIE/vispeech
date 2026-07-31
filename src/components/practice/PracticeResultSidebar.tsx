"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  RotateCcw,
  Smile,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface WordResult {
  word: string;
  phonetic?: string;
  score: number;
  status: "success" | "warning";
  expanded: boolean;
  lipFeedback?: string;
  soundFeedback?: string;
  recommendation?: string;
}

export interface PracticeResultSidebarProps {
  results: WordResult[];
  totalAccuracy: number;
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export default function PracticeResultSidebar({
  results,
  totalAccuracy,
  open,
  onClose,
  onRestart,
}: PracticeResultSidebarProps) {
  const [expandedWords, setExpandedWords] = useState<Set<string>>(new Set());

  if (!open) return null;

  const wordsNeedingPractice = results.filter(
    (r) => r.status === "warning"
  ).length;

  const isExpanded = (item: WordResult) =>
    expandedWords.has(item.word) ? !item.expanded : item.expanded;

  const toggleExpand = (index: number) => {
    const item = results[index];
    if (!item) return;
    setExpandedWords((prev) => {
      const next = new Set(prev);
      if (next.has(item.word)) {
        next.delete(item.word);
      } else {
        next.add(item.word);
      }
      return next;
    });
  };

  return (
    <>
      {/* Blurred background overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />

      {/* Right sidebar */}
      <aside className="fixed bottom-2 right-2 top-2 z-50 flex w-full max-w-sm flex-col rounded-3xl bg-white shadow-xl">
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <header>
            <h1 className="text-xl font-bold">ผลการฝึกแต่ละคำ</h1>
            <p className="mt-2 text-sm leading-5 text-neutral-500">
              ตรวจสอบผลการฝึกและปรับปรุงคำที่ยังติดขัดได้ที่นี่
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-md bg-yellow-100 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-100"
              >
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                {totalAccuracy.toFixed(1)}%
              </Badge>

              {wordsNeedingPractice > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-md bg-orange-100 px-3 py-2 text-sm font-semibold text-black hover:bg-orange-100"
                >
                  <AlertTriangle className="mr-1 h-4 w-4 fill-orange-500 text-orange-500" />
                  มี {wordsNeedingPractice} คำที่ควรฝึกเพิ่ม
                </Badge>
              )}
            </div>
          </header>

          <div className="my-5 border-t border-neutral-200" />

          <section className="space-y-3">
            {results.map((item, index) => (
              <Card
                key={item.word}
                className="overflow-hidden rounded-lg border border-neutral-200 shadow-none"
              >
                <CardContent className="p-0">
                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className="flex h-10 w-full items-center justify-between px-3"
                  >
                    <div className="flex items-center gap-2">
                      {item.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 fill-orange-500 text-orange-500" />
                      )}

                      <span className="text-sm font-semibold">{item.word}</span>
                      {item.phonetic && (
                        <span className="text-sm text-black">
                          {item.phonetic}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          item.status === "success"
                            ? "text-emerald-500"
                            : "text-orange-500"
                        }`}
                      >
                        {item.score}%
                      </span>
                      {isExpanded(item) ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded(item) && (
                    <div className="border-t border-neutral-100 px-3 py-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Smile className="h-5 w-5 text-black" />
                          <span className="font-semibold text-neutral-700">
                            ริมฝีปาก
                          </span>
                          <span className="text-neutral-400">:</span>
                          <span
                            className={`font-medium ${
                              item.lipFeedback?.includes("ไม่")
                                ? "text-orange-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {item.lipFeedback ?? "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Volume2 className="h-5 w-5 text-black" />
                          <span className="font-semibold text-neutral-700">
                            ระดับเสียง
                          </span>
                          <span className="text-neutral-400">:</span>
                          <span
                            className={`font-medium ${
                              item.soundFeedback?.includes("ไม่")
                                ? "text-orange-500"
                                : "text-emerald-500"
                            }`}
                          >
                            {item.soundFeedback ?? "-"}
                          </span>
                        </div>

                        {item.recommendation && (
                          <div className="flex items-start gap-3 text-sm">
                            <Sparkles className="mt-0.5 h-5 w-5 text-orange-500" />
                            <span className="font-semibold text-neutral-700">
                              คำแนะนำ
                            </span>
                            <span className="text-neutral-400">:</span>
                            <span className="flex-1 leading-5 text-orange-500">
                              {item.recommendation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </section>
        </div>

        <footer className="space-y-3 border-t border-neutral-100 px-5 pb-6 pt-4">
          <Button
            className="h-9 w-full rounded-full bg-black text-sm font-bold text-white hover:bg-neutral-800"
            onClick={onClose}
          >
            ปิด
          </Button>

          <Button
            variant="outline"
            className="h-9 w-full rounded-full border-neutral-300 bg-white text-sm font-medium text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
            onClick={onRestart}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            เริ่มการฝึกซ้ำ
          </Button>
        </footer>
      </aside>
    </>
  );
}
