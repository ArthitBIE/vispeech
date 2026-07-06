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
        <p className="text-lg text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">vispeech</h1>
      <p className="text-gray-600">ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด</p>
      <div className="flex gap-4 mt-4">
        <a href="/auth" className="rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">เข้าสู่ระบบ</a>
      </div>
    </div>
  );
}
