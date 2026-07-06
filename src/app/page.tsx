"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/auth";
      }
    }).catch(() => {
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
