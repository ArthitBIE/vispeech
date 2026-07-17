import React from "react";
import {
  Home,
  ChevronRight,
  ChevronLeft,
  Play,
  Volume2,
  Camera,
  Smile,
  Bot,
  Info,
  Mic,
  User,
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

const ImagePlaceholder = ({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) => (
  <div
    className={`flex items-center justify-center rounded-md bg-[#dddddd] text-[12px] font-semibold text-[#9a9a9a] ${className}`}
  >
    {label}
  </div>
);

const MascotPlaceholder = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-[#eeeeee] text-[#bdbdbd] ${className}`}
  >
    <User className="h-8 w-8" />
  </div>
);

export default function VispeechPracticeSession() {
  const progressBlocks = [true, true, false, false, false];

  const words = [
    { text: "ยา /ja:/", score: "100%", active: false, color: "text-[#00a982]" },
    { text: "ฝา /fa:/", score: "72%", active: false, color: "text-[#ff8a00]" },
    { text: "ดี /di:/", score: "-", active: true, color: "text-black" },
    { text: "มี /me:/", score: "-", active: false, color: "text-[#bcbcbc]" },
    { text: "ดู /du:/", score: "-", active: false, color: "text-[#bcbcbc]" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-black">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-[73px] items-center justify-between border-b border-[#e6e6e6] bg-white px-[140px]">
        <button className="flex items-center gap-1 text-[15px] font-medium text-[#ff4d4f]">
          <ChevronLeft className="h-4 w-4" />
          ยกเลิกการฝึก
        </button>

        <AvatarPlaceholder />
      </header>

      <main className="px-[118px] pb-10 pt-[133px]">
        {/* Breadcrumb */}
        <div className="mx-auto mb-4 flex w-full max-w-[1195px] items-center gap-3 text-[14px]">
          <Home className="h-5 w-5 text-[#8c8c8c]" />
          <span className="text-[#777]">Dashboard</span>
          <span className="text-[#bcbcbc]">/</span>
          <span className="text-[#777]">Lesson</span>
          <span className="text-[#bcbcbc]">/</span>
          <span className="font-bold text-black">Practice</span>
        </div>

        {/* Main card */}
        <section className="mx-auto grid h-[785px] w-full max-w-[1195px] grid-cols-[240px_1fr_245px] overflow-hidden rounded-2xl border border-[#d9d9d9] bg-white">
          {/* Left lesson panel */}
          <aside className="border-r border-[#eeeeee] bg-white px-5 py-5">
            <h2 className="text-[16px] font-bold">บทเรียน คำศัพท์ง่าย</h2>

            <div className="mt-4 flex gap-2">
              {progressBlocks.map((done, index) => (
                <div
                  key={index}
                  className={`h-3 w-3 rounded-sm ${
                    done ? "bg-[#00a982]" : "bg-[#d9d9d9]"
                  }`}
                />
              ))}
            </div>

            <p className="mt-5 text-[14px] font-medium text-[#d0d0d0]">คำที่ 2 / 5</p>

            <div className="my-5 h-px bg-[#e5e5e5]" />

            <h3 className="mb-3 text-[14px] font-bold">คำในบทนี้</h3>

            <div className="space-y-3 text-[14px]">
              {words.map((word) => (
                <div
                  key={word.text}
                  className={`flex items-center gap-1 ${word.color} ${
                    word.active ? "font-bold" : "font-medium"
                  }`}
                >
                  <span>{word.active ? "✱" : "◎"}</span>
                  <span>{word.text}</span>
                  <span>{word.score}</span>
                </div>
              ))}
            </div>

            <div className="my-6 h-px bg-[#e5e5e5]" />

            <h3 className="mb-4 text-[14px] font-bold">ความยาก</h3>
            <div className="flex gap-2 text-[#ffb000]">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < 2 ? "text-[#ffb000]" : "text-black"}>
                  ◇
                </span>
              ))}
            </div>
          </aside>

          {/* Center practice area */}
          <section className="bg-white px-5 py-[58px]">
            {/* Word player */}
            <div className="mx-auto flex h-[154px] max-w-[680px] flex-col items-center justify-center rounded-xl border border-[#cfcfcf]">
              <h1 className="text-[32px] font-bold leading-none">ดี</h1>
              <p className="mt-2 text-[18px]">/dee/</p>
              <p className="mt-1 text-[16px]">Good / ดี</p>

              <div className="mt-3 flex h-[18px] w-[190px] items-center overflow-hidden rounded border border-[#d9d9d9] bg-white text-[8px]">
                <div className="flex w-[42px] items-center justify-center gap-1 border-r border-[#d9d9d9]">
                  <Play className="h-2.5 w-2.5 fill-black" />
                  <span>0:00 / 0:01</span>
                </div>
                <div className="flex flex-1 items-center justify-end pr-2">
                  <Volume2 className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Visual examples */}
            <div className="mx-auto mt-9 grid max-w-[680px] grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-center gap-1 text-[12px] font-bold">
                  <Camera className="h-3.5 w-3.5" />
                  กล้อง
                </div>
                <ImagePlaceholder label="Camera Placeholder" className="h-[248px] w-full" />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1 text-[12px] font-bold">
                  <Smile className="h-3.5 w-3.5" />
                  ตัวอย่างริมฝีปาก
                </div>
                <ImagePlaceholder label="Lip Example Placeholder" className="h-[248px] w-full" />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button className="flex h-10 items-center gap-2 rounded-lg bg-black px-5 text-[13px] font-bold text-white">
                <Play className="h-4 w-4 fill-white" />
                เริ่มการฝึกออกเสียง
              </button>

              <button className="mt-5 flex items-center gap-1 text-[13px] text-[#b5b5b5]">
                ข้ามคำ
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Right tips panel */}
          <aside className="border-l border-[#eeeeee] bg-white px-5 py-6">
            <div className="mb-6 flex items-center gap-2 text-[15px] font-bold">
              <Bot className="h-5 w-5" />
              Tips จาก Pakky
            </div>

            <div className="rounded-lg border border-[#d9d9d9] bg-white px-4 py-4">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-bold">
                <Info className="h-4 w-4" />
                Tips การออกเสียง
              </div>

              <ul className="ml-4 list-disc space-y-2 text-[12px] leading-relaxed">
                <li>ยิ้มกว้างดึงข้าง</li>
                <li>ลิ้นยกสูงด้านหน้าชนเพดาน</li>
                <li>ฟันเผยอเล็กน้อย</li>
              </ul>
            </div>

            <div className="my-6 h-px bg-[#e5e5e5]" />

            {/* Sound level */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
                <Volume2 className="h-4 w-4" />
                ระดับเสียง
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-[170px] overflow-hidden rounded-full bg-[#dddddd]">
                  <div className="h-full w-[30%] rounded-full bg-[#f6a800]" />
                </div>
                <span className="text-[11px] text-[#bcbcbc]">30%</span>
              </div>
            </div>

            {/* Lip level */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-bold">
                <Smile className="h-4 w-4" />
                ริมฝีปาก
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-2 w-[170px] rounded-full bg-[#dddddd]">
                  <div className="h-full w-[70%] rounded-full bg-[#f6a800]" />
                  <div className="absolute left-[70%] top-1/2 h-4 w-px -translate-y-1/2 bg-[#777]" />
                </div>
                <span className="text-[11px] text-[#bcbcbc]">70%</span>
              </div>
            </div>

            <div className="my-7 h-px bg-[#e5e5e5]" />

            <div className="flex h-9 items-center rounded-lg border border-[#d9d9d9] px-3 text-[12px] text-[#bcbcbc]">
              กำลังรอเสียง ...
            </div>

            <div className="mt-[74px] rounded-lg border border-[#d9d9d9] bg-white px-4 py-4 text-[13px] font-semibold leading-relaxed shadow-sm">
              สู้ๆ นะ! ลองดูตัวอย่างริมฝีปาก แล้วเลียนแบบรูปปากดู!
            </div>

            <MascotPlaceholder className="mx-auto mt-7 h-[112px] w-[112px]" />
          </aside>
        </section>
      </main>
    </div>
  );
}