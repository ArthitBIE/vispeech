"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TitleLogo from "@/components/layout/TitleLogo";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!isSupabaseConfigured || !supabase?.auth) {
      setError(
        "ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL " +
          "และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local"
      );
      return;
    }

    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // With email confirmation enabled (Supabase default), signUp resolves with
      // session: null — tell the user instead of bouncing them to /auth/signin.
      if (!data.session) {
        setError(
          "กรุณายืนยันอีเมลของคุณ — เราได้ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว"
        );
        return;
      }
      router.push("/dashboard");
    } catch (err: any) {
      const messages: Record<string, string> = {
        "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        "Email not confirmed": "กรุณายืนยันอีเมลของคุณ",
        "User already registered": "อีเมลนี้ลงทะเบียนแล้ว",
        "Password should be at least 6 characters":
          "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      };
      setError(messages[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);

    if (!isSupabaseConfigured || !supabase?.auth) {
      setError(
        "ยังไม่ได้ตั้งค่า Supabase กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL " +
          "และ NEXT_PUBLIC_SUPABASE_ANON_KEY ในไฟล์ .env.local"
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/home`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="h-14 border-b border-border bg-background">
        <div className="flex h-full items-center justify-between px-5">
          <Link href="/" aria-label="Vispeech home">
            <TitleLogo />
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-2xl border border-border bg-background shadow-none">
          <CardHeader className="space-y-2 px-5 pt-5 pb-3">
            <div className="space-y-2">
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                Create your account
              </CardTitle>
              <p className="max-w-xs text-sm leading-5 text-muted-foreground">
                Enter your email below to create your account
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 rounded-md border-border text-sm placeholder:text-muted-foreground focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 rounded-md border-border pr-10 text-sm focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-1 flex items-center p-2 text-muted-foreground hover:text-muted-foreground"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Password
                </Label>

                <div className="relative">
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 rounded-md border-border pr-10 text-sm focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-1 flex items-center p-2 text-muted-foreground hover:text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="-mx-5 border-t border-border pt-5">
                <div className="px-5 space-y-3">
                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                    >
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {loading ? "กำลังสร้างบัญชี..." : "Sign-up"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="h-9 w-full rounded-lg border-border bg-background text-sm font-semibold text-foreground hover:bg-accent disabled:opacity-50"
                  >
                    <Image
                      src="/google-icon.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    Sign-up with Google
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center px-5 pb-5 pt-0">
            <Link
              href="/auth/signin"
              className="text-xs text-muted-foreground hover:underline"
            >
              Already have an account? Sign In
            </Link>
          </CardFooter>
        </Card>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">
          © 2026 Vispeech. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
