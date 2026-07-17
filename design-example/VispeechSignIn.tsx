import React from "react";
import { EyeOff } from "lucide-react";

const LogoPlaceholder = () => (
  <div className="flex h-7 w-7 items-center justify-center rounded bg-[#eeeeee] text-[8px] font-bold text-[#999]">
    LOGO
  </div>
);

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

export default function VispeechSignIn() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {/* Header */}
      <header className="flex h-[52px] items-center justify-between border-b border-[#e6e6e6] bg-white px-5">
        <div className="flex items-center gap-3">
          <LogoPlaceholder />
          <span className="text-[14px] font-medium">Vispeech</span>
        </div>

        <div className="flex items-center gap-5">
          <button className="text-[13px] font-medium text-[#777]">Login</button>
          <button className="h-8 rounded-md bg-black px-4 text-[12px] font-bold text-white">
            Get started
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4">
        <section className="mb-[72px] w-[430px] overflow-hidden rounded-2xl border border-[#d9d9d9] bg-white">
          <div className="px-4 py-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="text-[15px] font-bold">Login to your account</h1>
                <p className="mt-3 w-[245px] text-[13px] leading-snug text-[#aaaaaa]">
                  Enter your email below to login to your account
                </p>
              </div>

              <button className="text-[14px] font-bold">Sign Up</button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-[14px] font-bold">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="h-8 w-full rounded-md border border-[#d9d9d9] px-3 text-[13px] outline-none placeholder:text-[#b3b3b3] focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-[14px] font-bold">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    className="h-8 w-full rounded-md border border-[#d9d9d9] px-3 pr-9 text-[13px] outline-none focus:border-black"
                  />
                  <EyeOff className="absolute right-3 top-2 h-4 w-4 text-[#d2d2d2]" />
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-[#d9d9d9] px-4 py-5">
            <button className="h-9 w-full rounded-lg bg-black text-[13px] font-bold text-white">
              Login
            </button>

            <button className="mt-3 flex h-8 w-full items-center justify-center gap-3 rounded-lg border border-[#d9d9d9] bg-white text-[13px] font-bold">
              <GoogleIcon />
              Login with Google
            </button>

            <p className="mt-5 text-center text-[10px] font-medium text-[#b8b8b8]">
              Don&apos;t have an account?
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex h-[34px] items-center justify-center border-t border-[#d9d9d9] text-[11px] font-medium text-[#d0d0d0]">
        © 2026 Vispeech. All rights reserved.
      </footer>
    </div>
  );
}