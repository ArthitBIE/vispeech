import Image from "next/image";
import { getSupabaseUser } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { STREAK_GOAL } from "@/lib/constants";
import {
  computeStreak,
  dateKey,
  lastNDays,
  thaiFullDate,
  thaiWeekdayShort,
} from "@/lib/streak";
import { SidebarNav } from "./SidebarNav";

export async function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  let streak = 0;
  let startDate: Date | null = null;
  let practicedKeys = new Set<string>();

  const { supabase, user } = await getSupabaseUser();
  if (supabase && user) {
    const { data: logs } = await supabase
      .from("practice_logs")
      .select("created_at")
      .eq("user_id", user.id);
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

  const days = lastNDays(5);

  return (
    <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-[295px] shrink-0 flex-col overflow-y-auto border-r border-border bg-background">
      <SidebarNav onNavigate={onNavigate} />

      <div className="mt-3 border-t border-border px-4 pt-4">
        <div
          className="rounded-md p-[2px]"
          style={{
            background:
              "linear-gradient(90deg, #FF7700 0%, #FFC987 51%, #FFF9C4 100%)",
          }}
        >
          <Card className="overflow-hidden rounded-[calc(0.375rem-2px)] border-none shadow-none p-4">
            <CardContent className="p-0">
              <div className="flex items-start gap-2">
                <Image
                  src="/fire.png"
                  alt="Fire"
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 object-contain"
                  style={{ width: 24, height: 24 }}
                />
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

              <div className="mt-2 grid grid-cols-5 gap-1">
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className="rounded border border-border bg-background p-1 text-center"
                  >
                    <p className="text-[8px] text-muted-foreground">
                      {thaiWeekdayShort(day)}
                    </p>
                    <div className="mt-1 flex justify-center">
                      <Image
                        src="/fire.png"
                        alt="Fire"
                        width={12}
                        height={12}
                        className={
                          practicedKeys.has(dateKey(day))
                            ? "h-3 w-3 object-contain"
                            : "h-3 w-3 object-contain opacity-20"
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-foreground">
                    เป้าหมาย {STREAK_GOAL} วัน
                  </span>
                  <div className="w-full max-w-[120px] h-1 rounded-full bg-muted mt-1">
                    <div
                      className="h-1 rounded-full bg-orange-400"
                      style={{
                        width: `${Math.min(100, (streak / STREAK_GOAL) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    อีกแค่ {Math.max(0, STREAK_GOAL - streak)} วัน ก็ครบ{" "}
                    {STREAK_GOAL} วันแล้วนะ!
                  </span>
                </div>
                <Image
                  src="/mascot/image 6.webp"
                  alt="Streak mascot"
                  width={651}
                  height={609}
                  className="ml-auto object-contain"
                  style={{ width: 60, height: 60 }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-auto border-t border-border px-4 py-8">
        <div className="rounded-md border border-border px-4 py-3 text-center text-sm font-semibold text-foreground">
          แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
        </div>
        <div
          className="mx-auto mt-6 relative h-[160px] w-[160px] overflow-hidden rounded-full"
          style={{ backgroundColor: "#F7F7F7" }}
        >
          <Image
            src="/mascot/image 5.webp"
            alt="Pakky mascot"
            width={651}
            height={609}
            className="absolute bottom-[-10px] h-[160px] w-[160px] object-contain"
          />
        </div>
      </div>
    </aside>
  );
}
