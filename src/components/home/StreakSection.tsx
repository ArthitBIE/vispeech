import Image from "next/image";
import Link from "next/link";
import { Flame, Sparkles, Play } from "lucide-react";
import { STREAK_GOAL } from "@/lib/constants";
import { thaiFullDate } from "@/lib/streak";
import { Button } from "@/components/ui/button";
import { lessonHref, LESSONS } from "@/lib/lesson";

interface StreakInfo {
  streak: number;
  startDate: Date | null;
}

// Server Component — renders immediately without hydration delay
// Contains the LCP heading for the home page
export function StreakSection({ streakInfo }: { streakInfo: StreakInfo }) {
  return (
    <section className="mb-7 max-w-3xl rounded-xl border border-orange-300 bg-card p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="text-orange-500">
              <Flame className="h-9 w-9 fill-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                ต่อเนื่อง {streakInfo.streak} วันแล้ว!
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {streakInfo.startDate
                  ? `เริ่มตั้งแต่ ${thaiFullDate(streakInfo.startDate)}`
                  : "ยังไม่ได้เริ่มฝึก"}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-4">
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-orange-400"
                style={{
                  width: `${Math.min(100, (streakInfo.streak / STREAK_GOAL) * 100)}%`,
                }}
              />
            </div>
            <p className="text-base font-medium text-foreground">
              {streakInfo.streak}/{STREAK_GOAL}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-foreground">
              แนะนำการฝึกวันนี้
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="font-semibold text-foreground">
              {LESSONS[0].name} บทที่ 1
            </span>
            <Button
              asChild
              className="h-8 rounded-md bg-foreground px-4 text-xs font-bold text-background hover:bg-foreground/90"
            >
              <Link href={lessonHref(LESSONS[0].id)}>
                <Play className="mr-2 h-3 w-3 fill-current" />
                เริ่มการฝึก
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden items-end justify-center md:flex">
          <Image
            src="/mascot/image 6.webp"
            alt="Banner mascot"
            width={160}
            height={160}
            className="h-40 w-40 object-bottom"
            priority
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
