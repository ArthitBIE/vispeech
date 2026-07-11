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
    <div className="flex min-h-screen items-center justify-center bg-neutral-bg px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-ambient-mid">
        <h1 className="headline mb-2 text-center text-ink">
          vispeech
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด
        </p>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL
            และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
          </div>
        )}

        <h2 className="title mb-6 text-center text-ink">
          {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-danger-light p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label mb-1 block text-muted">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email"
              className="w-full rounded-md border border-border-default bg-surface px-4 py-2 text-ink placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label mb-1 block text-muted">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
              data-testid="login-password"
              className="w-full rounded-md border border-border-default bg-surface px-4 py-2 text-ink placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="อย่างน้อย 6 ตัวอักษร"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            data-testid="login-submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-surface font-medium transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high disabled:opacity-50"
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
            className="text-sm text-primary hover:text-primary-hover"
          >
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
