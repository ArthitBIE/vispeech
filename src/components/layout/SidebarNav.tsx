"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "หน้าหลัก", icon: Home },
  { href: "/dashboard", label: "ความก้าวหน้า", icon: BarChart3 },
  { href: "/settings", label: "การตั้งค่า", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
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
  );
}
