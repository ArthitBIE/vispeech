"use client";

import React from "react";
import Link from "next/link";
import {
  Home,
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
import TitleLogo from "@/components/layout/TitleLogo";

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
    <main className="min-h-screen bg-neutral-50 text-black font-sans">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="Vispeech home">
            <TitleLogo />
          </Link>

          <button
            type="button"
            aria-label="Open profile menu"
            className="h-8 w-8 overflow-hidden rounded-full bg-neutral-300 ring-1 ring-neutral-200"
          >
            <div className="flex h-full w-full items-center justify-center bg-neutral-300 text-xs font-semibold text-neutral-600">
              U
            </div>
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
            <Home className="h-5 w-5 text-neutral-400" />
            <span>Dashboard</span>
            <span>/</span>
            <span>Lesson</span>
            <span>/</span>
            <span>Practice</span>
            <span>/</span>
            <span className="text-black">Summarize</span>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-9 px-0 text-sm font-medium text-neutral-400 hover:bg-transparent hover:text-neutral-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              เริ่มการฝึกซ้ำ
            </Button>

            <Button className="h-9 rounded-md bg-black px-4 text-sm font-bold text-white hover:bg-neutral-800">
              กลับหน้าหลัก
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-none">
          <CardContent className="p-0">
            <section className="flex flex-col items-center px-6 pt-10 pb-9 text-center">
              <div className="mb-8 flex h-44 w-44 items-center justify-center rounded-full bg-neutral-100">
                <div className="h-32 w-32 rounded-full bg-neutral-300" />
              </div>

              <h1 className="text-lg font-bold leading-6">
                เยี่ยมมากเลย!
                <br />
                ฝึกครบทุกคำแล้ววันนี้เก่งมาก!
              </h1>

              <p className="mt-6 text-base font-medium">
                Lesson คำศัพท์ง่าย
              </p>

              <div className="mt-3 flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <Star className="h-5 w-5 text-neutral-300" />
              </div>
            </section>

            <section className="mx-auto mb-10 max-w-5xl px-6">
              <div className="overflow-hidden rounded-t-xl bg-neutral-100">
                <div className="border-b border-neutral-200 px-6 py-5">
                  <h2 className="text-lg font-bold">ผลการฝึกแต่ละคำ</h2>
                </div>

                <div className="space-y-5 px-5 py-6">
                  {results.map((item) => (
                    <div key={item.word}>
                      <div className="flex h-9 items-center justify-between bg-white px-4">
                        <div className="flex items-center gap-3">
                          {item.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 fill-orange-500 text-orange-500" />
                          )}

                          <span className="text-sm font-semibold">
                            {item.word}
                          </span>
                          <span className="text-sm font-medium text-black">
                            {item.phonetic}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">
                            {item.score}
                          </span>
                          <ChevronDown className="h-4 w-4 text-neutral-600" />
                        </div>
                      </div>

                      {item.expanded ? (
                        <div className="rounded-b-lg bg-white px-4 pb-5 pt-3">
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Smile className="h-5 w-5 text-black" />
                              <span className="font-bold">ริมฝีปาก</span>
                              <span>:</span>
                              <span className="font-medium text-orange-500">
                                ปากกว้างไม่พอ
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <Volume2 className="h-5 w-5 text-black" />
                              <span className="font-bold">ระดับเสียง</span>
                              <span>:</span>
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
      </section>
    </main>
  );
}