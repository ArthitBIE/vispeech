"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  Flame,
  Mic,
  ListChecks,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "หน้าแรก", icon: Home },
  { href: "/dashboard", label: "แดชบอร์ด", icon: BarChart3 },
  { href: "/practice/session", label: "ฝึกฝน", icon: Mic },
  { href: "/summary", label: "สรุปผล", icon: ListChecks },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

const STREAK = 20; // ponytail: stubbed until streak table exists

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[266px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          V
        </div>
        <span className="text-lg font-semibold">vispeech</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Flame className="h-4 w-4 text-brand" />
            ติดต่อกัน
            <Badge variant="secondary" className="ml-auto">
              {STREAK} วัน
            </Badge>
          </div>
          <Progress value={STREAK} className="mt-2" />
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">🦊</AvatarFallback>
          </Avatar>
          <p className="text-xs text-muted-foreground">
            มาสร้างเสียงภาษาไทยให้ชัดเจนไปด้วยกัน!
          </p>
        </div>
      </div>
    </aside>
  );
}
