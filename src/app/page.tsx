"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.push("/auth");
      return;
    }

    supabase!
      .auth.getSession()
      .then(({ data: { session } }: any) => {
        if (session) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/auth";
        }
      })
      .catch(() => {
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="display text-ink">vispeech</h1>
      <p className="text-muted">ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด</p>
      <div className="flex gap-4 mt-4">
        <a href="/auth" className="rounded-md bg-primary px-6 py-3 text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high">เข้าสู่ระบบ</a>
      </div>
    </div>
  );
}
