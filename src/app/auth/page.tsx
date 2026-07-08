"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured || !supabase?.auth) {
      setError(
        "ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL " +
          "และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local",
      );
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }

      router.push("/dashboard");
    } catch (err: any) {
      const messages: Record<string, string> = {
        "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        "Email not confirmed": "กรุณายืนยันอีเมลของคุณ",
        "User already registered": "อีเมลนี้ลงทะเบียนแล้ว",
        "Password should be at least 6 characters": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      };
      setError(messages[err.message] || err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          vispeech
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL
            และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
          </div>
        )}

        <h2 className="mb-6 text-center text-lg font-semibold text-gray-800">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="login-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            data-testid="login-submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "กำลังดำเนินการ..."
              : !isSupabaseConfigured
                ? "กรุณาตั้งค่าระบบก่อน"
                : isLogin
                  ? "เข้าสู่ระบบ"
                  : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
