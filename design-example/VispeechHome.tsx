import React from "react";
import {
  Home,
  BarChart2,
  Settings,
  Search,
  Play,
  Sparkles,
  Headphones,
  User,
} from "lucide-react";

const lessons = [
  {
    title: "คำศัพท์ง่าย",
    chapter: "บทที่ 1",
    desc: "ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด",
    label: "คำศัพท์",
    value: "5",
  },
  {
    title: "เสียงสระ",
    chapter: "บทที่ 1",
    desc: "ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด",
    label: "เสียง",
    value: "32",
  },
  {
    title: "บทสนทนา",
    chapter: "บทที่ 1",
    desc: "ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด",
    label: "บทสนทนา",
    value: "5",
  },
];

const MiniMascot = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-[#eeeeee] text-[#bdbdbd] ${className}`}
  >
    <User className="h-7 w-7" />
  </div>
);

export default function VispeechHome() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[52px] items-center justify-between border-b border-[#e6e6e6] bg-white px-5">
        <div className="flex items-center gap-3">
          <div className="relative h-7 w-7">
            <div className="absolute left-1 top-1 h-6 w-3 rotate-[-32deg] bg-black" />
            <div className="absolute right-1 top-1 h-6 w-3 rotate-[32deg] bg-black" />
            <div className="absolute left-[11px] top-2 h-4 w-2 rotate-[-32deg] bg-[#cfcfcf]" />
          </div>
          <span className="text-[14px] font-medium">Vispeech</span>
        </div>

        <div className="h-8 w-8 overflow-hidden rounded-full bg-[#d9d9d9]">
          <div className="flex h-full w-full items-center justify-center text-[9px] text-[#777]">
            IMG
          </div>
        </div>
      </header>

      <div className="flex pt-[52px]">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-[52px] w-[266px] border-r border-[#e6e6e6] bg-white">
          <div className="flex h-full flex-col justify-between px-5 py-6">
            <div>
              <nav className="space-y-3">
                <button className="flex h-10 items-center gap-3 rounded-lg bg-[#f1f1f1] px-3 text-[14px] font-semibold">
                  <Home className="h-4 w-4" />
                  หน้าหลัก
                </button>

                <button className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-black">
                  <BarChart2 className="h-4 w-4" />
                  ความก้าวหน้า
                </button>

                <button className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-black">
                  <Settings className="h-4 w-4" />
                  การตั้งค่า
                </button>
              </nav>

              <div className="my-8 h-px bg-[#dddddd]" />

              {/* Mini streak card */}
              <div className="relative rounded-md border border-[#ff9a3d] bg-white p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-[10px] font-bold">ต่อเนื่อง 2 วันแล้ว!</p>
                    <p className="text-[6px] text-[#b5b5b5]">
                      เริ่มตั้งแต่ อาทิตย์ที่ 5 ก.ค. 2569
                    </p>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-5 gap-1">
                  {["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส"].map((d, i) => (
                    <div
                      key={d}
                      className="h-[36px] rounded border border-[#ededed] bg-white text-center text-[6px]"
                    >
                      <div className={i > 1 ? "text-[#d5d5d5]" : "text-black"}>
                        {d}
                      </div>
                      <div className="mt-1 text-[10px]">{i < 2 ? "🔥" : "-"}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[8px] font-bold">เป้าหมาย 10 วัน</p>
                <div className="mt-1 h-1.5 w-[105px] overflow-hidden rounded-full bg-[#d9d9d9]">
                  <div className="h-full w-[20%] rounded-full bg-gradient-to-r from-[#ffb44b] to-[#ff7a1a]" />
                </div>
                <p className="mt-1 text-[7px] text-[#777]">
                  อีกแค่ 8 วัน ก็ครบ 10 วันแล้วนะ!
                </p>

                <MiniMascot className="absolute bottom-2 right-2 h-10 w-10" />
              </div>
            </div>

            <div>
              <div className="mb-8 h-px bg-[#dddddd]" />
              <div className="rounded-md border border-[#d5d5d5] px-3 py-4 text-center text-[11px] font-semibold">
                แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
              </div>
              <MiniMascot className="mx-auto mt-5 h-[116px] w-[116px]" />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-[266px] flex min-h-[calc(100vh-52px)] flex-1 justify-center px-10 py-4">
          <section className="w-full max-w-[1095px] rounded-xl border border-[#d9d9d9] bg-white px-8 py-7">
            {/* Page title */}
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <h1 className="text-[16px] font-bold">หน้าหลัก</h1>
              </div>
              <p className="mt-1 text-[14px] text-[#b6b6b6]">
                เลือกบทเรียนที่อยากฝึกวันนี้เลย
              </p>
            </div>

            {/* Hero card */}
            <div className="relative mb-8 flex h-[214px] w-[715px] overflow-hidden rounded-xl border border-[#ff9a3d] bg-white px-7 py-7">
              <div className="z-10 flex-1">
                <div className="flex items-center gap-4">
                  <span className="text-[42px]">🔥</span>
                  <div>
                    <h2 className="text-[24px] font-bold">ต่อเนื่อง 2 วันแล้ว!</h2>
                    <p className="text-[9px] text-[#b6b6b6]">
                      เริ่มตั้งแต่ อาทิตย์ที่ 5 ก.ค. 2569
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div className="flex h-[24px] w-[350px] overflow-hidden rounded-full bg-[#d9d9d9]">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 border-r border-[#c8c8c8] last:border-r-0 ${
                          i < 2
                            ? "bg-gradient-to-r from-[#ffbd52] to-[#ff7d1b]"
                            : "bg-[#d9d9d9]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[18px] font-medium">2/10</span>
                </div>

                <div className="mt-7 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#ff8a1d]" />
                  <p className="text-[16px] font-semibold">
                    แนะนำการฝึกวันนี้
                    <span className="mx-3 text-[#777]">·</span>
                    คำศัพท์ง่าย บทที่ 1
                  </p>
                  <button className="flex h-8 items-center gap-1 rounded bg-black px-4 text-[11px] font-bold text-white">
                    <Play className="h-3 w-3 fill-white" />
                    เริ่มการฝึก
                  </button>
                </div>
              </div>

              <MiniMascot className="absolute bottom-0 right-10 h-[180px] w-[180px] opacity-70" />
            </div>

            {/* Filters/search */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex gap-3">
                {["ทั้งหมด (3)", "กำลังเรียน (1)", "เสร็จแล้ว (0)", "ยังไม่เริ่ม (3)"].map(
                  (tab, i) => (
                    <button
                      key={tab}
                      className={`h-9 rounded-full px-4 text-[12px] ${
                        i === 0
                          ? "bg-black font-bold text-white"
                          : "bg-[#f3f3f3] text-[#b5b5b5]"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="relative h-8 w-[260px]">
                <input
                  className="h-full w-full rounded border border-[#eeeeee] px-3 pr-8 text-[11px] outline-none"
                  placeholder="ค้นหาบทเรียน"
                />
                <Search className="absolute right-3 top-2 h-4 w-4 text-[#cfcfcf]" />
              </div>
            </div>

            <div className="mb-6 h-px bg-[#dddddd]" />

            {/* Lessons */}
            <div className="mb-6 flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              <h3 className="text-[17px] font-bold">บทเรียนทั้งหมด</h3>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <article
                  key={lesson.title}
                  className="rounded-3xl border border-[#d9d9d9] bg-white p-4"
                >
                  <div className="relative mb-4 h-[135px] overflow-hidden rounded-lg bg-[#eeeeee]">
                    <MiniMascot className="absolute bottom-2 right-4 h-16 w-16" />
                  </div>

                  <h4 className="text-[17px] font-bold">{lesson.title}</h4>
                  <p className="text-[12px] font-medium text-[#777]">{lesson.chapter}</p>

                  <p className="mt-3 min-h-[44px] text-[12px] leading-snug text-[#777]">
                    {lesson.desc}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-[#f7f7f7] py-3 text-center">
                      <p className="text-[10px] text-[#777]">{lesson.label}</p>
                      <p className="text-[22px] font-bold">{lesson.value}</p>
                    </div>

                    <div className="rounded-lg bg-[#f7f7f7] py-3 text-center">
                      <p className="text-[10px] text-[#777]">การฝึก</p>
                      <p className="text-[22px] font-bold">-</p>
                    </div>
                  </div>

                  <button className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-black text-[12px] font-bold text-white">
                    <Play className="h-3.5 w-3.5 fill-white" />
                    เริ่มการฝึก
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}