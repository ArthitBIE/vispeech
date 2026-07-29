import React from "react"
import {
  Home,
  BarChart3,
  Settings,
  Flame,
  Mic,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
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
              className="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-black hover:bg-neutral-50"
            >
              <BarChart3 className="h-5 w-5" />
              ความก้าวหน้า
            </a>

            <a
              href="#"
              className="flex h-11 items-center gap-3 rounded-lg bg-neutral-100 px-3 text-sm font-semibold text-black"
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

        <section className="w-full bg-neutral-50 px-4 py-10 lg:ml-60 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                System Settings
              </h1>

              <div className="mt-8 inline-flex border-b border-black pb-2 text-sm font-medium">
                Settings
              </div>
            </div>

            <div className="rounded-xl bg-neutral-100 p-4">
              <div className="mb-8 flex items-start justify-between gap-6 px-4 pt-2">
                <div>
                  <h2 className="text-base font-bold">
                    Enable Microphone Input
                  </h2>
                  <p className="mt-2 text-sm text-neutral-400">
                    Allow the app to access your microphone for speech practice sessions.
                  </p>
                </div>

                <Switch defaultChecked className="data-[state=checked]:bg-black" />
              </div>

              <Card className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-none">
                <CardContent className="p-0">
                  <div className="grid border-b border-neutral-200 md:grid-cols-2">
                    <div className="p-6">
                      <h3 className="text-base font-bold">Input device</h3>
                      <p className="mt-3 text-sm text-neutral-400">
                        Select the microphone you want to use for practice.
                      </p>
                    </div>

                    <div className="p-6">
                      <h3 className="text-base font-bold">
                        Choose your input device
                      </h3>

                      <div className="mt-3 w-full max-w-xs">
                        <Select defaultValue="macbook">
                          <SelectTrigger className="h-11 rounded-md border-neutral-300 text-sm">
                            <SelectValue placeholder="Choose device" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="macbook">
                              MacBook Pro2019 Inter...
                            </SelectItem>
                            <SelectItem value="external">
                              External Microphone
                            </SelectItem>
                            <SelectItem value="airpods">
                              AirPods Microphone
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2">
                    <div className="p-6">
                      <h3 className="text-base font-bold">
                        Microphone sensitivity
                      </h3>
                      <p className="mt-3 text-sm text-neutral-400">
                        Adjust how sensitive the mic is during practice.
                      </p>
                    </div>

                    <div className="p-6">
                      <h3 className="text-base font-bold">
                        Adjust sensitivity level
                      </h3>

                      <div className="mt-4 flex max-w-sm items-center gap-4">
                        <Slider
                          defaultValue={[60]}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <span className="text-sm font-medium text-neutral-400">
                          60%
                        </span>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-base font-bold">Test microphone</h3>
                        <p className="mt-2 text-sm text-neutral-400">
                          Make sure your selected device is working properly.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          <Button className="h-9 rounded-md bg-black px-4 text-sm font-bold text-white hover:bg-neutral-800">
                            <Mic className="mr-2 h-4 w-4" />
                            Start Test
                          </Button>

                          <div className="h-1 w-36 rounded-full bg-neutral-200" />

                          <span className="text-sm font-medium text-neutral-400">
                            Level : -
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}