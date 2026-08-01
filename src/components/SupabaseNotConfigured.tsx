"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface SupabaseNotConfiguredProps {
  ctaHref: string;
  ctaLabel?: string;
}

export function SupabaseNotConfigured({
  ctaHref,
  ctaLabel = "ไปหน้าเข้าสู่ระบบ",
}: SupabaseNotConfiguredProps) {
  return (
    <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-orange-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-800">
            ยังไม่ได้ตั้งค่า Supabase
          </h3>
          <p className="mt-2 text-sm text-orange-700">
            โปรดเพิ่ม{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-100 font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            และ{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-100 font-mono text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            ในไฟล์{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-100 font-mono text-xs">
              .env.local
            </code>
          </p>
          <p className="mt-1 text-sm text-orange-700">
            ดูรายละเอียดได้ที่{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-100 font-mono text-xs">
              CONFIGURATION.md
            </code>
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
