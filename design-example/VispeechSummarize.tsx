import React from "react";
import {
  Home,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  Volume2,
  AudioLines,
  Sparkles,
  Star,
} from "lucide-react";

const LogoPlaceholder = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded bg-[#eeeeee] text-[8px] font-bold text-[#999]">
    LOGO
  </div>
);

const AvatarPlaceholder = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9d9d9] text-[8px] font-bold text-[#777]">
    IMG
  </div>
);

const MascotPlaceholder = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-[#eeeeee] text-[#bdbdbd] ${className}`}
  >
    <User className="h-12 w-12" />
  </div>
);

const words = [
  {
    status: "success",
    word: "ยา",
    phonetic: "/ja:/",
    score: "100%",
    open: false,
  },
  {
    status: "warning",
    word: "ฝา",
    phonetic: "/fa:/",
    score: "72%",
    open: true,
  },
  {
    status: "success",
    word: "ดี",
    phonetic: "/dee:/",
    score: "88%",
    open: false,
  },
  {
    status: "warning",
    word: "มี",
    phonetic: "/me:/",
    score: "65%",
    open: false,
  },
  {
    status: "success",
    word: "ดู",
    phonetic: "/du:/",
    score: "98%",
    open: false,
  },
];

export default function VispeechSummarize() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[73px] items-center justify-between border-b border-[#e6e6e6] bg-white px-[135px]">
        <div className="flex items-center gap-4">
          <LogoPlaceholder />
          <div className="h-7 w-px rotate-[24deg] bg-[#d9d9d9]" />
          <span className="text-[13px] font-semibold">Vispeech</span>
        </div>

        <AvatarPlaceholder />
      </header>

      <main className="px-[118px] pb-12 pt-[133px]">
        {/* Breadcrumb/action row */}
        <div className="mx-auto mb-4 flex w-full max-w-[1195px] items-center justify-between">
          <div className="flex items-center gap-3 text-[14px]">
            <Home className="h-5 w-5 text-[#8c8c8c]" />
            <span className="text-[#777]">Dashboard</span>
            <span className="text-[#bcbcbc]">/</span>
            <span className="text-[#777]">Lesson</span>
            <span className="text-[#bcbcbc]">/</span>
            <span className="text-[#777]">Practice</span>
            <span className="text-[#bcbcbc]">/</span>
            <span className="font-bold text-black">Summarize</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-[12px] font-medium text-[#b8b8b8]">
              <RotateCcw className="h-3.5 w-3.5" />
              เริ่มการฝึกซ้ำ
            </button>

            <button className="flex h-8 items-center gap-1 rounded-lg bg-black px-4 text-[12px] font-bold text-white">
              กลับหน้าหลัก
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main card */}
        <section className="mx-auto min-h-[920px] w-full max-w-[1195px] rounded-2xl border border-[#d9d9d9] bg-white">
          {/* Summary hero */}
          <div className="flex flex-col items-center pt-10 text-center">
            <MascotPlaceholder className="h-[210px] w-[210px]" />

            <h1 className="mt-8 text-[18px] font-semibold leading-snug">
              เยี่ยมมากเลย!
              <br />
              ฝึกครบทุกคำแล้ววันนี้เก่งมาก!
            </h1>

            <p className="mt-6 text-[16px] font-semibold">Lesson คำศัพท์ง่าย</p>

            <div className="mt-4 flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="h-6 w-6 fill-[#ffb000] text-[#ffb000]" />
              ))}
              <Star className="h-6 w-6 text-[#d9d9d9]" />
            </div>
          </div>

          {/* Result panel */}
          <div className="mx-auto mt-12 w-[1085px] overflow-hidden rounded-xl bg-[#f4f4f4]">
            <div className="border-b border-[#dddddd] px-6 py-5">
              <h2 className="text-[18px] font-bold">ผลการฝึกแต่ละคำ</h2>
            </div>

            <div className="px-6 py-6">
              <div className="space-y-5">
                {words.map((item) => (
                  <div key={item.word}>
                    <div className="flex h-9 items-center justify-between bg-white px-4">
                      <div className="flex items-center gap-3">
                        {item.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-[#00a982]" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 fill-[#ff8a00] text-[#ff8a00]" />
                        )}

                        <span className="text-[14px] font-semibold">{item.word}</span>
                        <span className="text-[13px]">{item.phonetic}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-medium">{item.score}</span>
                        <ChevronDown className="h-4 w-4 text-[#777]" />
                      </div>
                    </div>

                    {item.open && (
                      <div className="rounded-b-lg bg-white px-5 pb-6 pt-4">
                        <div className="space-y-5 text-[14px]">
                          <div className="flex items-center gap-3">
                            <Volume2 className="h-5 w-5 text-black" />
                            <span className="font-bold">ริมฝีปาก</span>
                            <span>:</span>
                            <span className="font-medium text-[#ff7a00]">
                              ปากกว้างไม่พอ
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <AudioLines className="h-5 w-5 text-black" />
                            <span className="font-bold">ระดับเสียง</span>
                            <span>:</span>
                            <span className="font-medium text-[#00a982]">ถูกต้อง</span>
                          </div>

                          <div className="flex items-center gap-3 text-[#ff7a00]">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-medium">
                              ลองอ้าปากกว้างขึ้นให้เห็นฟันบนเล็กน้อย
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}