"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react";
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
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
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="h-14 border-b border-border bg-background">
        <div className="flex h-full items-center justify-between px-5">
          <Link href="/" aria-label="Vispeech home">
            <TitleLogo />
          </Link>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
              asChild
            >
              <Link href="/auth/signin">Login</Link>
            </Button>

            <Button
              size="sm"
              className="h-8 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-accent"
              asChild
            >
              <Link href="/auth/signin">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-2xl border border-border bg-background shadow-none">
          <CardHeader className="space-y-2 px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                  Create your account
                </CardTitle>
                <p className="max-w-xs text-sm leading-5 text-muted-foreground">
                  Enter your email below to create your account
                </p>
              </div>

              <Link
                href="/auth/signin"
                className="mt-1 whitespace-nowrap text-sm font-semibold text-foreground hover:underline"
              >
                Sign In
              </Link>
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
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 rounded-md border-border pr-10 text-sm focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-muted-foreground"
                  >
                    <EyeOff className="h-4 w-4" />
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
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 rounded-md border-border pr-10 text-sm focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-muted-foreground"
                  >
                    <EyeOff className="h-4 w-4" />
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
                    className="h-9 w-full rounded-lg border-border bg-background text-sm font-semibold text-foreground hover:bg-accent"
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-sm font-bold">
                      <span className="text-blue-500">G</span>
                    </span>
                    Sign-up with Google
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center px-5 pb-5 pt-0">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?
            </p>
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
