import React from "react";
import {
  Home,
  BarChart2,
  Settings,
  User,
  Mic,
  ChevronDown,
} from "lucide-react";

const MiniMascot = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center rounded-full bg-[#eeeeee] text-[#bdbdbd] ${className}`}
  >
    <User className="h-7 w-7" />
  </div>
);

export default function VispeechSettings() {
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

        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#d9d9d9] text-[9px] text-[#777]">
          IMG
        </div>
      </header>

      <div className="flex pt-[52px]">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-[52px] w-[266px] border-r border-[#e6e6e6] bg-white">
          <div className="flex h-full flex-col justify-between px-5 py-6">
            <div>
              <nav className="space-y-3">
                <button className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-black">
                  <Home className="h-4 w-4" />
                  หน้าหลัก
                </button>

                <button className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] font-medium text-black">
                  <BarChart2 className="h-4 w-4" />
                  ความก้าวหน้า
                </button>

                <button className="flex h-10 items-center gap-3 rounded-lg bg-[#f1f1f1] px-3 text-[14px] font-semibold">
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
                  <div className="h-full w-[20%] rounded-full bg-gradient-to-r from-[#ffbd52] to-[#ff7d1b]" />
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
        <main className="ml-[266px] min-h-[calc(100vh-52px)] flex-1 px-[54px] py-[42px]">
          <section className="mx-auto w-full max-w-[1075px]">
            <h1 className="text-[24px] font-bold tracking-[-0.02em]">
              System Settings
            </h1>

            <div className="mt-7 inline-block border-b border-black pb-2 text-[14px] font-medium">
              Settings
            </div>

            {/* Settings panel */}
            <div className="mt-7 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
              {/* Enable row */}
              <div className="flex h-[95px] items-start justify-between bg-[#f0f0f0] px-8 py-5">
                <div>
                  <h2 className="text-[14px] font-bold">Enable Microphone Input</h2>
                  <p className="mt-2 text-[13px] text-[#aaaaaa]">
                    Allow the app to access your microphone for speech practice sessions.
                  </p>
                </div>

                <button className="relative mt-1 h-[19px] w-[34px] rounded-full bg-black">
                  <span className="absolute right-[3px] top-[3px] h-[13px] w-[13px] rounded-full bg-white" />
                </button>
              </div>

              {/* Card body */}
              <div className="min-h-[575px] rounded-t-2xl border-t border-[#d7d7d7] bg-white">
                {/* Input device row */}
                <div className="grid grid-cols-2 border-b border-[#d7d7d7] px-8 py-7">
                  <div>
                    <h3 className="text-[14px] font-bold">Input device</h3>
                    <p className="mt-3 text-[13px] text-[#aaaaaa]">
                      Select the microphone you want to use for practice.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold">Choose your input device</h3>
                    <button className="mt-3 flex h-10 w-[215px] items-center justify-between rounded-md border border-[#d9d9d9] bg-white px-4 text-[12px] font-medium">
                      <span className="truncate">MacBook Pro2019 Inter...</span>
                      <ChevronDown className="h-4 w-4 text-[#777]" />
                    </button>
                  </div>
                </div>

                {/* Sensitivity row */}
                <div className="grid grid-cols-2 px-8 py-7">
                  <div>
                    <h3 className="text-[14px] font-bold">Microphone sensitivity</h3>
                    <p className="mt-3 text-[13px] text-[#aaaaaa]">
                      Adjust how sensitive the mic is during practice.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold">Adjust sensitivity level</h3>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="relative h-1.5 w-[215px] rounded-full bg-[#d9d9d9]">
                        <div className="h-full w-[60%] rounded-full bg-black" />
                        <div className="absolute left-[60%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#bbbbbb] bg-white" />
                      </div>
                      <span className="text-[12px] text-[#b0b0b0]">60%</span>
                    </div>

                    <div className="mt-7">
                      <h3 className="text-[14px] font-bold">Test microphone</h3>
                      <p className="mt-1 text-[13px] text-[#aaaaaa]">
                        Make sure your selected device is working properly.
                      </p>

                      <div className="mt-4 flex items-center gap-4">
                        <button className="flex h-8 items-center gap-2 rounded-md bg-black px-4 text-[12px] font-bold text-white">
                          <Mic className="h-3.5 w-3.5" />
                          Start Test
                        </button>

                        <div className="h-1 w-[165px] rounded-full bg-[#e7e7e7]" />
                        <span className="text-[12px] text-[#b0b0b0]">Level : -</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}