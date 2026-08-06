import Image from "next/image";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { STREAK_GOAL } from "@/lib/constants";
import {
  computeStreak,
  dateKey,
  lastNDays,
  thaiFullDate,
  thaiWeekdayShort,
} from "@/lib/streak";
import { SidebarNav } from "./SidebarNav";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  let streak = 0;
  let startDate: Date | null = null;
  let practicedKeys = new Set<string>();

  // Uses React.cache — shared with Header and page components
  // in the same request, eliminating redundant getUser() calls.
  const user = await getCurrentUser();
  if (user) {
    const supabase = await createServerClient();
    if (supabase) {
      const { data: logs } = await supabase
        .from("practice_logs")
        .select("created_at");
      if (logs) {
        const keys = logs.map((l: { created_at: string }) =>
          dateKey(new Date(l.created_at))
        );
        const result = computeStreak(keys);
        streak = result.streak;
        startDate = result.startDate;
        practicedKeys = new Set(keys);
      }
    }
  }

  const days = lastNDays(5);

  return (
    <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-[266px] shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-5 border-t border-border px-4 pt-5">
        <Card className="rounded-md border border-orange-300 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <Flame className="h-5 w-5 fill-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  ต่อเนื่อง {streak} วันแล้ว!
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {startDate
                    ? `เริ่มตั้งแต่ ${thaiFullDate(startDate)}`
                    : "ยังไม่ได้เริ่มฝึก"}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-1">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="rounded border border-border bg-background p-1 text-center"
                >
                  <p className="text-[8px] text-muted-foreground">
                    {thaiWeekdayShort(day)}
                  </p>
                  <div className="mt-1 flex justify-center">
                    <Flame
                      className={
                        practicedKeys.has(dateKey(day))
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
                  style={{
                    width: `${Math.min(100, (streak / STREAK_GOAL) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] font-medium text-muted-foreground">
                อีกแค่ {Math.max(0, STREAK_GOAL - streak)} วัน ก็ครบ{" "}
                {STREAK_GOAL} วันแล้วนะ!
              </p>
            </div>

            <Image
              src="/mascot/image 6.webp"
              alt="Streak mascot"
              width={56}
              height={56}
              className="mt-2 ml-auto h-14 w-14 rounded-md"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-auto border-t border-border px-4 py-8">
        <div className="rounded-md border border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
          แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
        </div>
        <Image
          src="/mascot/image 5.webp"
          alt="Pakky mascot"
          width={128}
          height={128}
          className="mx-auto mt-6 h-32 w-32 rounded-full"
        />
      </div>
    </aside>
  );
}
