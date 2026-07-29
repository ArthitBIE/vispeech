"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const results = [
  {
    word: "ยา",
    phonetic: "/ja:/",
    score: "100%",
    status: "success",
    expanded: false,
  },
  {
    word: "ฝา",
    phonetic: "/fa:/",
    score: "72%",
    status: "warning",
    expanded: true,
  },
  {
    word: "ดี",
    phonetic: "/dee:/",
    score: "88%",
    status: "success",
    expanded: false,
  },
  {
    word: "มี",
    phonetic: "/me:/",
    score: "65%",
    status: "warning",
    expanded: false,
  },
  {
    word: "ดู",
    phonetic: "/du:/",
    score: "98%",
    status: "success",
    expanded: false,
  },
];

export default function SummarizePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="h-9 px-0 text-sm font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          เริ่มการฝึกซ้ำ
        </Button>

        <Button className="h-9 rounded-md bg-foreground px-4 text-sm font-bold text-background hover:bg-foreground/90">
          กลับหน้าหลัก
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Completion section */}
      <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-none">
        <CardContent className="p-0">
          <section className="flex flex-col items-center px-6 pt-10 pb-9 text-center">
            <div className="mb-8 flex h-44 w-44 items-center justify-center rounded-full bg-muted">
              <div className="h-32 w-32 rounded-full bg-muted-foreground/20" />
            </div>

            <h1 className="text-lg font-bold leading-6 text-foreground">
              เยี่ยมมากเลย!
              <br />
              ฝึกครบทุกคำแล้ววันนี้เก่งมาก!
            </h1>

            <p className="mt-6 text-base font-medium text-muted-foreground">
              Lesson คำศัพท์ง่าย
            </p>

            <div className="mt-3 flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 text-muted-foreground/30" />
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
                {results.map((item) => (
                  <div key={item.word}>
                    <div className="flex h-9 items-center justify-between bg-card px-4">
                      <div className="flex items-center gap-3">
                        {item.status === "success" ? (
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
                          {item.score}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    {item.expanded ? (
                      <div className="rounded-b-lg bg-card px-4 pb-5 pt-3">
                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Smile className="h-5 w-5 text-foreground" />
                            <span className="font-bold text-foreground">
                              ริมฝีปาก
                            </span>
                            <span className="text-muted-foreground">:</span>
                            <span className="font-medium text-orange-500">
                              ปากกว้างไม่พอ
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Volume2 className="h-5 w-5 text-foreground" />
                            <span className="font-bold text-foreground">
                              ระดับเสียง
                            </span>
                            <span className="text-muted-foreground">:</span>
                            <span className="font-medium text-emerald-500">
                              ถูกต้อง
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-orange-500">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-medium">
                              ลองอ้าปากกว้างขึ้นให้เห็นฟันบนเล็กน้อย
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
