import React from "react"
import {
  Home,
  BarChart3,
  Settings,
  Flame,
  Play,
  RotateCcw,
  Star,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const progressItems = [
  {
    title: "คำศัพท์ง่าย",
    chapter: "บทที่ 1",
    progressText: "5 / 5 คำ",
    progressWidth: "100%",
    completed: true,
    highlighted: true,
    accuracy: "84.6%",
    warning: "มี 2 คำที่ควรฝึกเพิ่ม",
  },
  {
    title: "เสียงสระ",
    chapter: "บทที่ 1",
    progressText: "0 / 31 เสียง",
    progressWidth: "0%",
    completed: false,
    highlighted: false,
  },
  {
    title: "บทสนทนา",
    chapter: "บทที่ 1",
    progressText: "0 / 5 บทสนทนา",
    progressWidth: "0%",
    completed: false,
    highlighted: false,
  },
]

export default function ProgressPage() {
  return (
    <main className="min-h-screen bg-white text-black font-sans">
      <header className="fixed left-0 right-0 top-0 z-40 h-14 border-b border-neutral-200 bg-white">
        <div className="flex h-full items-center justify-between px-5">
          <a href="#" className="flex items-center gap-3" aria-label="Vispeech home">
            {/* LOGO PLACEHOLDER: replace this block with the real Vispeech logo */}
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute h-7 w-7 rotate-45 bg-black" />
              <div className="absolute top-1 h-6 w-3 bg-white" />
              <div className="relative text-xs font-bold tracking-tight text-white">
                V
              </div>
            </div>

            <div className="h-6 w-px bg-neutral-300" />

            <span className="text-sm font-medium text-neutral-900">
              Vispeech
            </span>
          </a>

          {/* PROFILE IMAGE PLACEHOLDER: replace with user avatar image */}
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
            <a
              href="#"
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black hover:bg-neutral-50"
            >
              <Home className="h-5 w-5" />
              หน้าหลัก
            </a>

            <a
              href="#"
              className="flex h-11 items-center gap-3 rounded-lg bg-neutral-100 px-3 text-sm font-semibold text-black"
            >
              <BarChart3 className="h-5 w-5" />
              ความก้าวหน้า
            </a>

            <a
              href="#"
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black hover:bg-neutral-50"
            >
              <Settings className="h-5 w-5" />
              การตั้งค่า
            </a>
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

                {/* SIDEBAR SMALL CHARACTER PLACEHOLDER: replace with mascot image */}
                <div className="mt-2 ml-auto h-14 w-14 rounded-md bg-neutral-200" />
              </CardContent>
            </Card>
          </div>

          <div className="absolute bottom-8 left-6 right-6 border-t border-neutral-200 pt-8">
            <div className="rounded-md border border-neutral-300 px-4 py-3 text-center text-sm font-semibold">
              แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
            </div>

            {/* SIDEBAR LARGE CHARACTER PLACEHOLDER: replace with large mascot image */}
            <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-neutral-100">
              <div className="h-24 w-24 rounded-full bg-neutral-300" />
            </div>
          </div>
        </aside>

        <section className="w-full px-4 py-4 lg:ml-60 lg:px-9">
          <div className="mx-auto min-h-[calc(100vh-96px)] max-w-6xl rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              <h1 className="text-lg font-bold">ความก้าวหน้าทั้งหมด</h1>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {progressItems.map((item, index) => (
                <Card
                  key={item.title}
                  className={
                    item.highlighted
                      ? "relative overflow-visible rounded-2xl border border-black shadow-none"
                      : "relative overflow-hidden rounded-2xl border border-neutral-200 shadow-none"
                  }
                >
                  {item.highlighted && (
                    <div className="absolute -right-1 -top-3 text-orange-500">
                      <AlertTriangle className="h-5 w-5 fill-orange-500 text-orange-500" />
                    </div>
                  )}

                  <CardContent className="relative min-h-48 p-6">
                    <div className="relative z-10 max-w-md">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={
                            item.highlighted
                              ? "text-lg font-bold text-black"
                              : "text-lg font-bold text-neutral-500"
                          }
                        >
                          {item.title}
                        </h2>
                        <span className="font-bold text-neutral-500">·</span>
                        <p
                          className={
                            item.highlighted
                              ? "text-lg font-bold text-black"
                              : "text-lg font-bold text-neutral-500"
                          }
                        >
                          {item.chapter}
                        </p>
                      </div>

                      <p className="mt-2 max-w-sm text-sm leading-5 text-neutral-400">
                        ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน
                        พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                      </p>

                      <p
                        className={
                          item.highlighted
                            ? "mt-4 text-sm font-bold text-black"
                            : "mt-4 text-sm font-bold text-neutral-600"
                        }
                      >
                        {item.progressText}
                      </p>

                      <div className="mt-3 h-5 max-w-sm overflow-hidden rounded-full bg-neutral-300">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{ width: item.progressWidth }}
                        />
                      </div>

                      {item.completed ? (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-100"
                          >
                            <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {item.accuracy}
                          </Badge>

                          <Badge
                            variant="secondary"
                            className="rounded-md bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                          >
                            <AlertTriangle className="mr-1 h-3 w-3 fill-orange-500 text-orange-500" />
                            {item.warning}
                          </Badge>
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        {item.completed ? (
                          <>
                            <Button className="h-8 rounded-md bg-black px-4 text-xs font-bold text-white hover:bg-neutral-800">
                              <BarChart3 className="mr-2 h-3 w-3" />
                              สรุปผล
                            </Button>

                            <Button
                              variant="ghost"
                              className="h-8 px-0 text-xs font-semibold text-neutral-400 hover:bg-transparent hover:text-neutral-600"
                            >
                              <RotateCcw className="mr-2 h-3 w-3" />
                              เริ่มการฝึกซ้ำ
                            </Button>
                          </>
                        ) : (
                          <Button className="h-8 rounded-md bg-black px-4 text-xs font-bold text-white hover:bg-neutral-800">
                            <Play className="mr-2 h-3 w-3 fill-white" />
                            เริ่มการฝึก
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* PROGRESS CARD CHARACTER PLACEHOLDER: replace with mascot/lesson illustration */}
                    <div
                      className={
                        item.highlighted
                          ? "absolute bottom-4 right-8 h-28 w-28 rounded-full bg-neutral-200"
                          : "absolute bottom-4 right-8 h-28 w-28 rounded-full bg-neutral-200 opacity-60"
                      }
                    />

                    {/* DECORATION PLACEHOLDER: optional confetti/sparkle decoration */}
                    {item.highlighted && (
                      <div className="absolute bottom-8 right-14 h-24 w-32 rounded-xl border border-dashed border-neutral-300 opacity-60" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}