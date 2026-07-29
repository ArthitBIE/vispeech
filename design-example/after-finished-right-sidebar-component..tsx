import React from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

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
    lipFeedback: "ปากกว้างไม่พอ",
    soundFeedback: "ถูกต้อง",
    recommendation: "ลองอ้าปากกว้างขึ้นให้เห็นฟันบนเล็กน้อย",
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
    score: "100%",
    status: "success",
    expanded: false,
  },
]

export default function ProgressResultSidebar() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-100 font-sans text-black">
      {/* BLURRED BACKGROUND AREA: this intentionally replaces the real progress page */}
      <section className="absolute inset-0 flex items-center justify-center bg-white blur-sm">
        <div className="rounded-2xl border border-neutral-200 bg-white px-12 py-8 text-center shadow-sm">
          <p className="text-4xl font-bold tracking-tight text-neutral-400">
            progress page
          </p>
          <p className="mt-3 text-sm text-neutral-300">
            blurred background placeholder
          </p>
        </div>
      </section>

      {/* EXTRA DIM LAYER OVER BLURRED PAGE */}
      <div className="absolute inset-0 bg-black/10" />

      {/* RIGHT RESULT SIDEBAR */}
      <aside className="absolute bottom-2 right-2 top-2 z-10 flex w-full max-w-sm flex-col rounded-3xl bg-white shadow-xl md:right-2">
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
                84.6%
              </Badge>

              <Badge
                variant="secondary"
                className="rounded-md bg-orange-100 px-3 py-2 text-sm font-semibold text-black hover:bg-orange-100"
              >
                <AlertTriangle className="mr-1 h-4 w-4 fill-orange-500 text-orange-500" />
                มี 2 คำที่ควรฝึกเพิ่ม
              </Badge>
            </div>
          </header>

          <div className="my-5 border-t border-neutral-200" />

          <section className="space-y-3">
            {results.map((item) => (
              <Card
                key={item.word}
                className="overflow-hidden rounded-lg border border-neutral-200 shadow-none"
              >
                <CardContent className="p-0">
                  <div className="flex h-10 items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      {item.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 fill-orange-500 text-orange-500" />
                      )}

                      <span className="text-sm font-semibold">{item.word}</span>
                      <span className="text-sm text-black">{item.phonetic}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.score}</span>
                      {item.expanded ? (
                        <ChevronUp className="h-4 w-4 text-neutral-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                  </div>

                  {item.expanded ? (
                    <div className="border-t border-neutral-100 px-3 py-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Smile className="h-5 w-5 text-black" />
                          <span className="font-semibold text-neutral-700">
                            ริมฝีปาก
                          </span>
                          <span className="text-neutral-400">:</span>
                          <span className="font-medium text-orange-500">
                            {item.lipFeedback}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <Volume2 className="h-5 w-5 text-black" />
                          <span className="font-semibold text-neutral-700">
                            ระดับเสียง
                          </span>
                          <span className="text-neutral-400">:</span>
                          <span className="font-medium text-emerald-500">
                            {item.soundFeedback}
                          </span>
                        </div>

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
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </section>
        </div>

        <footer className="space-y-3 border-t border-neutral-100 px-5 pb-6 pt-4">
          <Button className="h-9 w-full rounded-full bg-black text-sm font-bold text-white hover:bg-neutral-800">
            ปิด
          </Button>

          <Button
            variant="outline"
            className="h-9 w-full rounded-full border-neutral-300 bg-white text-sm font-medium text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            เริ่มการฝึกซ้ำ
          </Button>
        </footer>
      </aside>
    </main>
  )
}