import Image from "next/image";
import Link from "next/link";
import { Sparkles, Play } from "lucide-react";
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
    <div
      className="mb-7 max-w-3xl overflow-hidden rounded-xl p-[2px] relative"
      style={{
        background:
          "linear-gradient(90deg, #FF7700 0%, #FFC987 51%, #FFF9C4 100%)",
      }}
    >
      <section className="h-[240px] overflow-hidden rounded-[calc(1rem-2px)] bg-card p-6">
        <div className="pr-[280px]">
          <div className="flex items-start gap-4">
            <div className="text-orange-500">
              <Image
                src="/fire.png"
                alt="Fire"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
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
      </section>

      <div className="absolute bottom-0 right-0 w-[250px] h-full">
        <Image
          src="/mascot/image 6.webp"
          alt="Banner mascot"
          width={651}
          height={609}
          className="w-full h-full object-contain object-bottom"
          priority
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
