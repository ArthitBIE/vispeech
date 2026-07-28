"use client";

import Link from "next/link";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import TitleLogo from "@/components/layout/TitleLogo";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col font-sans">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="Vispeech home">
            <TitleLogo />
          </Link>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-medium text-neutral-500 hover:text-black hover:bg-transparent"
              asChild
            >
              <Link href="/auth/signup">Login</Link>
            </Button>

            <Button
              size="sm"
              className="h-8 rounded-md bg-black px-4 text-xs font-semibold text-white hover:bg-neutral-800"
              asChild
            >
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-none">
          <CardHeader className="space-y-2 px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-base font-semibold tracking-tight text-black">
                  Login to your account
                </CardTitle>
                <p className="max-w-xs text-sm leading-5 text-neutral-400">
                  Enter your email below to login to your account
                </p>
              </div>

              <Link
                href="/auth/signup"
                className="mt-1 whitespace-nowrap text-sm font-semibold text-black hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <form className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-black"
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
                  className="h-9 rounded-md border-neutral-300 text-sm placeholder:text-neutral-400 focus-visible:ring-neutral-300"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-black"
                >
                  Password
                </Label>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-9 rounded-md border-neutral-300 pr-10 text-sm focus-visible:ring-neutral-300"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    className="absolute inset-y-0 right-3 flex items-center text-neutral-300 hover:text-neutral-500"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="-mx-5 border-t border-neutral-200 pt-5">
                <div className="px-5 space-y-3">
                  <Button
                    type="submit"
                    className="h-9 w-full rounded-lg bg-black text-sm font-semibold text-white hover:bg-neutral-800"
                  >
                    Login
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full rounded-lg border-neutral-300 bg-white text-sm font-semibold text-black hover:bg-neutral-50"
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center text-sm font-bold">
                      <span className="text-blue-500">G</span>
                    </span>
                    Login with Google
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="justify-center px-5 pb-5 pt-0">
            <p className="text-xs text-neutral-300">
              Don&apos;t have an account?
            </p>
          </CardFooter>
        </Card>
      </section>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="px-6 py-4 text-center text-xs font-medium text-neutral-200">
          © 2026 Vispeech. All rights reserved.
        </div>
      </footer>
    </main>
  );
}