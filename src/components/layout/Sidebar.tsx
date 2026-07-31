"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "หน้าหลัก", icon: Home },
  { href: "/dashboard", label: "ความก้าวหน้า", icon: BarChart3 },
  { href: "/settings", label: "การตั้งค่า", icon: Settings },
];

const STREAK = 2;
const STREAK_GOAL = 10;
const STREAK_START = "อาทิตย์ที่ 5 ก.ค. 2569";

const DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส"];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[266px] shrink-0 flex-col border-r border-border bg-background">
      <nav className="flex flex-col gap-1 px-4 pt-6">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "font-medium text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-border px-4 pt-5">
        <Card className="rounded-md border border-orange-300 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Flame className="h-5 w-5 fill-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  ต่อเนื่อง {STREAK} วันแล้ว!
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  เริ่มตั้งแต่ {STREAK_START}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className="rounded border border-border bg-background p-1 text-center"
                >
                  <p className="text-[8px] text-muted-foreground">{day}</p>
                  <div className="mt-1 flex justify-center">
                    <Flame
                      className={
                        i < STREAK
                          ? "h-3 w-3 fill-orange-500 text-orange-500"
                          : "h-3 w-3 text-muted-foreground/30"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-foreground">
                <span>เป้าหมาย {STREAK_GOAL} วัน</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-orange-400"
                  style={{ width: `${(STREAK / STREAK_GOAL) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                อีกแค่ {STREAK_GOAL - STREAK} วัน ก็ครบ {STREAK_GOAL} วันแล้วนะ!
              </p>
            </div>

            <div className="mt-2 ml-auto h-14 w-14 rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-auto border-t border-border px-4 py-8">
        <div className="rounded-md border border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
          แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
        </div>
        <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-muted">
          <div className="h-24 w-24 rounded-full bg-muted-foreground/20" />
        </div>
      </div>
    </aside>
  );
}
