"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Camera,
  Smile,
  Bot,
  Info,
  Volume2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

const words = [
  {
    label: "ยา /ja:/",
    score: "100%",
    color: "text-emerald-500",
  },
  {
    label: "ฝา /fa:/",
    score: "72%",
    color: "text-orange-500",
  },
  {
    label: "ดี /di:/",
    score: "-",
    color: "text-neutral-700",
  },
  {
    label: "มี /me:/",
    score: "-",
    color: "text-neutral-300",
  },
  {
    label: "ดู /du:/",
    score: "-",
    color: "text-neutral-300",
  },
];

export default function PracticePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-neutral-50 text-black font-sans">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Button
            variant="ghost"
            className="h-9 px-0 text-base font-medium text-red-500 hover:bg-transparent hover:text-red-600"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            ยกเลิกการฝึก
          </Button>

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
        <nav className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <Home className="h-5 w-5 text-neutral-400" />
          <span>Dashboard</span>
          <span>/</span>
          <span>Lesson</span>
          <span>/</span>
          <span className="text-black">Practice</span>
        </nav>

        <div className="grid min-h-[700px] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[230px_1fr_230px]">
          <aside className="border-b border-neutral-200 bg-white p-5 lg:border-b-0 lg:border-r">
            <div>
              <h1 className="text-base font-bold">บทเรียน คำศัพท์ง่าย</h1>

              <div className="mt-4 flex gap-2">
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                <div className="h-3 w-3 rounded-sm bg-neutral-300" />
                <div className="h-3 w-3 rounded-sm bg-neutral-300" />
                <div className="h-3 w-3 rounded-sm bg-neutral-300" />
              </div>

              <p className="mt-4 text-sm font-semibold text-neutral-300">
                คำที่ 2 / 5
              </p>
            </div>

            <div className="my-6 border-t border-neutral-200" />

            <section>
              <h2 className="text-sm font-bold">คำในบทนี้</h2>

              <div className="mt-4 space-y-3">
                {words.map((word) => (
                  <div
                    key={word.label}
                    className={`flex items-center gap-1 text-sm font-medium ${word.color}`}
                  >
                    <span>◎</span>
                    <span>{word.label}</span>
                    <span>{word.score}</span>
                  </div>
                ))}
              </div>
            </section>

            <div className="my-6 border-t border-neutral-200" />

            <section>
              <h2 className="text-sm font-bold">ความยาก</h2>

              <div className="mt-4 flex gap-2">
                {[0, 1].map((item) => (
                  <span
                    key={item}
                    className="h-4 w-4 rounded-full border border-orange-400"
                  />
                ))}

                {[0, 1, 2].map((item) => (
                  <span
                    key={item}
                    className="h-4 w-4 rounded-full border border-neutral-900"
                  />
                ))}
              </div>
            </section>
          </aside>

          <section className="bg-white p-5 lg:p-7">
            <Card className="mx-auto max-w-2xl rounded-xl border border-neutral-300 shadow-none">
              <CardContent className="p-6 text-center">
                <h2 className="text-4xl font-bold leading-none">ดี</h2>
                <p className="mt-2 text-lg font-medium">/dee/</p>
                <p className="mt-1 text-base font-medium">Good / ดี</p>

                <div className="mx-auto mt-4 flex h-5 w-44 items-center rounded border border-neutral-200 bg-white px-2">
                  <Play className="h-3 w-3 fill-black text-black" />
                  <div className="mx-2 h-1 flex-1 rounded-full bg-neutral-200">
                    <div className="h-1 w-1/5 rounded-full bg-black" />
                  </div>
                  <Volume2 className="h-3 w-3 text-black" />
                </div>
              </CardContent>
            </Card>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Camera className="h-4 w-4" />
                  <span>กล้อง</span>
                </div>

                <div className="flex h-56 items-center justify-center rounded-sm bg-neutral-100 text-center text-sm leading-5 text-neutral-400">
                  <div>
                    <p>ยังไม่ได้เปิดกล้อง</p>
                    <p>กด &quot;เริ่มฝึก&quot; ด้านล่าง</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Smile className="h-4 w-4" />
                  <span>ตัวอย่างริมฝีปาก</span>
                </div>

                <div className="flex h-56 items-center justify-center rounded-sm bg-neutral-300">
                  <div className="relative h-44 w-36 rounded-b-full rounded-t-sm bg-neutral-100">
                    <div className="absolute left-1/2 top-10 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-2 border-neutral-300" />
                    <div className="absolute left-1/2 top-20 h-7 w-24 -translate-x-1/2 rounded-full bg-red-300">
                      <div className="absolute left-2 right-2 top-3 h-1 rounded-full bg-white" />
                      <div className="absolute bottom-2 left-3 right-3 h-px bg-red-700" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 h-4 w-8 -translate-x-1/2 rounded-t-full border-t border-neutral-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <Button className="h-10 rounded-lg bg-black px-5 text-sm font-bold text-white hover:bg-neutral-800">
                <Play className="mr-2 h-4 w-4 fill-white" />
                เริ่มการฝึกออกเสียง
              </Button>

              <Button
                variant="ghost"
                className="mt-3 h-8 text-sm font-medium text-neutral-300 hover:bg-transparent hover:text-neutral-500"
              >
                ข้ามคำ
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </section>

          <aside className="border-t border-neutral-200 bg-white p-5 lg:border-l lg:border-t-0">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h2 className="text-base font-bold">Tips จาก Pakky</h2>
              </div>

              <Card className="rounded-lg border border-neutral-200 shadow-none">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold">
                    <Info className="h-4 w-4" />
                    <span>Tips การออกเสียง</span>
                  </div>

                  <ul className="ml-5 list-disc space-y-2 text-sm leading-5 text-black">
                    <li>ยิ้มกว้างถึงข้าง</li>
                    <li>ลิ้นยกสูงด้านหน้าชนเพดาน</li>
                    <li>ฟันเผยอเล็กน้อย</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Volume2 className="h-4 w-4" />
                  <span>ระดับเสียง</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={30} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-neutral-300">
                    30%
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Smile className="h-4 w-4" />
                  <span>ริมฝีปาก</span>
                </div>

                <div className="flex items-center gap-3">
                  <Progress value={70} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-neutral-300">
                    70%
                  </span>
                </div>
              </div>
            </section>

            <div className="my-8 border-t border-neutral-200" />

            <Input
              readOnly
              value="กำลังรอเสียง ..."
              className="h-10 rounded-lg border-neutral-200 text-sm text-neutral-400"
            />

            <div className="mt-16">
              <div className="rounded-lg border border-neutral-200 bg-white px-4 py-4 text-center text-sm font-semibold leading-5 shadow-sm">
                ครึ่งทางแล้ว! คำที่ 3
                <br />
                หายใจลึกๆ แล้วค่อยๆ พูดนะ
              </div>

              <div className="mx-auto mt-8 flex h-32 w-32 items-center justify-center rounded-full bg-neutral-100">
                <div className="h-24 w-24 rounded-full bg-neutral-300" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}