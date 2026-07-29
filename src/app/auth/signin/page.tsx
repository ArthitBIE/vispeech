"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
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
    <div className="flex min-h-screen bg-background noise-bg">
      {/* Brand Panel */}
      <div className="hidden w-1/2 items-center justify-center bg-muted/30 p-8 lg:flex">
        <div className="max-w-sm text-center">
          <img
            src="/title-top-left.svg"
            alt="Vispeech Logo"
            className="mx-auto mb-6 h-auto w-32"
          />
          <h2 className="text-balance text-2xl font-semibold text-foreground">
            ฝึกออรักษ์ พูดภาษาไทยเป็นภาษาต้นฉบับ
          </h2>
          <p className="mt-3 text-muted-foreground">
            เรียนรู้การออรักษ์อย่างถูกต้อง ด้วยการฝึกฝนและรับคำติชมจากระบบ
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <Card variant="elevated" className="w-full max-w-sm space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-balance text-2xl font-semibold text-foreground">
              เข้าสู่ระบบ
            </h1>
            <p className="text-muted-foreground">
              ป้อนอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบบัญชีของคุณ
            </p>
          </div>

          <div className="space-y-6">
            {!isSupabaseConfigured && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL
                และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  อีเมล
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่าน
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    data-testid="login-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    tabIndex={0}
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !isSupabaseConfigured}
                data-testid="login-submit"
                className="h-10 w-full bg-brand text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                {loading ? "กำลังดำเนินการ..." : !isSupabaseConfigured ? "กรุณาตั้งค่าระบบก่อน" : "เข้าสู่ระบบ"}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              disabled
              className="flex h-10 w-full items-center justify-center gap-3 text-sm font-medium"
            >
              <GoogleIcon />
              เข้าสู่ระบบด้วย Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ยังไม่มีบัญชี?{" "}
              <Link href="/auth/signup" className="font-medium text-brand hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}