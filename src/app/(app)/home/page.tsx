"use client";

import Link from "next/link";
import {
  Home,
  BarChart3,
  Settings,
  Search,
  Flame,
  Sparkles,
  Play,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TitleLogo from "@/components/layout/TitleLogo";

const lessons = [
  {
    title: "คำศัพท์ง่าย",
    chapter: "บทที่ 1",
    typeLabel: "คำศัพท์",
    count: "5",
  },
  {
    title: "เสียงสระ",
    chapter: "บทที่ 1",
    typeLabel: "เสียง",
    count: "32",
  },
  {
    title: "บทสนทนา",
    chapter: "บทที่ 1",
    typeLabel: "บทสนทนา",
    count: "5",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans">
      <header className="fixed left-0 right-0 top-0 z-40 h-14 border-b border-neutral-200 bg-white">
        <div className="flex h-full items-center justify-between px-5">
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

      <div className="flex min-h-screen pt-14">
        <aside className="fixed bottom-0 left-0 top-14 hidden w-60 border-r border-neutral-200 bg-white px-6 py-6 lg:block">
          <nav className="space-y-3">
            <Link
              href="/dashboard/home"
              className="flex h-11 items-center gap-3 rounded-lg bg-neutral-100 px-3 text-sm font-semibold text-black"
            >
              <Home className="h-5 w-5" />
              หน้าหลัก
            </Link>

            <Link
              href="/dashboard/progress"
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black hover:bg-neutral-50"
            >
              <BarChart3 className="h-5 w-5" />
              ความก้าวหน้า
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black hover:bg-neutral-50"
            >
              <Settings className="h-5 w-5" />
              การตั้งค่า
            </Link>
          </nav>

          <div className="mt-8 border-t border-neutral-200 pt-6">
            <Card className="rounded-md border-orange-300 shadow-none">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Flame className="h-5 w-5 fill-orange-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-black">
                      ต่อเนื่อง 2 วันแล้ว!
                    </p>
                    <p className="mt-1 text-[10px] text-neutral-400">
                      เริ่มตั้งแต่ อาทิตย์ที่ 5 ก.ค. 2569
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-1">
                  {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส"].map(
                    (day, index) => (
                      <div
                        key={day}
                        className="rounded border border-neutral-200 bg-white p-1 text-center"
                      >
                        <p className="text-[8px] text-neutral-500">{day}</p>
                        <div className="mt-1 flex justify-center">
                          <Flame
                            className={
                              index < 2
                                ? "h-3 w-3 fill-orange-500 text-orange-500"
                                : "h-3 w-3 text-neutral-200"
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[10px] font-semibold">
                    <span>เป้าหมาย 10 วัน</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200">
                    <div className="h-2 w-1/5 rounded-full bg-orange-400" />
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-neutral-500">
                    อีกแค่ 8 วัน ก็ครบ 10 วันแล้วนะ!
                  </p>
                </div>

                <div className="mt-2 ml-auto h-14 w-14 rounded-md bg-neutral-200" />
              </CardContent>
            </Card>
          </div>

          <div className="absolute bottom-8 left-6 right-6 border-t border-neutral-200 pt-8">
            <div className="rounded-md border border-neutral-300 px-4 py-3 text-center text-sm font-semibold">
              แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
            </div>

            <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-neutral-100">
              <div className="h-24 w-24 rounded-full bg-neutral-300" />
            </div>
          </div>
        </aside>

        <section className="w-full px-4 py-4 lg:ml-60 lg:px-9">
          <div className="mx-auto max-w-6xl rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <h1 className="text-lg font-bold">หน้าหลัก</h1>
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                เลือกบทเรียนที่อยากฝึกวันนี้เลย
              </p>
            </div>

            <section className="mb-7 max-w-3xl rounded-xl border border-orange-300 bg-white p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="text-orange-500">
                      <Flame className="h-9 w-9 fill-orange-500" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold">
                        ต่อเนื่อง 2 วันแล้ว!
                      </h2>
                      <p className="mt-1 text-xs text-neutral-400">
                        เริ่มตั้งแต่ อาทิตย์ที่ 5 ก.ค. 2569
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center gap-4">
                    <div className="h-5 flex-1 overflow-hidden rounded-full bg-neutral-300">
                      <div className="h-full w-1/5 rounded-full bg-orange-400" />
                    </div>
                    <p className="text-base font-medium">2/10</p>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold">แนะนำการฝึกวันนี้</span>
                    <span className="text-neutral-500">·</span>
                    <span className="font-semibold">คำศัพท์ง่าย บทที่ 1</span>
                    <Button className="h-8 rounded-md bg-black px-4 text-xs font-bold text-white hover:bg-neutral-800">
                      <Play className="mr-2 h-3 w-3 fill-white" />
                      เริ่มการฝึก
                    </Button>
                  </div>
                </div>

                <div className="hidden items-center justify-center md:flex">
                  <div className="h-40 w-40 rounded-xl bg-neutral-200" />
                </div>
              </div>
            </section>

            <section className="mb-6">
              <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black">
                    ทั้งหมด (3)
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100"
                  >
                    กำลังเรียน (1)
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100"
                  >
                    เสร็จแล้ว (0)
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-100"
                  >
                    ยังไม่เริ่ม (3)
                  </Badge>
                </div>

                <div className="relative w-full md:w-72">
                  <Input
                    type="search"
                    placeholder="ค้นหาบทเรียน"
                    className="h-9 rounded-md border-neutral-200 pr-9 text-sm placeholder:text-neutral-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-neutral-300" />
                </div>
              </div>
            </section>

            <section>
              <div className="mb-6 flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <h2 className="text-lg font-bold">บทเรียนทั้งหมด</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {lessons.map((lesson) => (
                  <Card
                    key={lesson.title}
                    className="rounded-2xl border border-neutral-200 shadow-none"
                  >
                    <CardContent className="p-4">
                      <div className="relative mb-4 h-32 overflow-hidden rounded-lg bg-neutral-200">
                        <div className="absolute bottom-2 right-4 h-16 w-16 rounded-full bg-neutral-300" />
                      </div>

                      <h3 className="text-lg font-bold leading-tight">
                        {lesson.title}
                      </h3>
                      <p className="text-sm font-medium text-neutral-500">
                        {lesson.chapter}
                      </p>

                      <p className="mt-4 min-h-10 text-sm leading-5 text-neutral-500">
                        ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน
                        พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-neutral-100 px-4 py-3 text-center">
                          <p className="text-xs text-neutral-500">
                            {lesson.typeLabel}
                          </p>
                          <p className="mt-1 text-xl font-bold">
                            {lesson.count}
                          </p>
                        </div>

                        <div className="rounded-lg bg-neutral-100 px-4 py-3 text-center">
                          <p className="text-xs text-neutral-500">การฝึก</p>
                          <p className="mt-1 text-xl font-bold">-</p>
                        </div>
                      </div>

                      <Button className="mt-5 h-10 w-full rounded-lg bg-black text-sm font-bold text-white hover:bg-neutral-800">
                        <Play className="mr-2 h-4 w-4 fill-white" />
                        เริ่มการฝึก
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}