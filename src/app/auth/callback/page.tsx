"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      const msg = errorDescription || error;
      router.replace(`/auth/signin?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (!supabase) {
      console.error("[AuthCallback] supabase client is null — env vars missing?");
      router.replace("/auth/signin?error=Supabase+not+configured");
      return;
    }

    // getSession() triggers the OAuth code exchange and sets session cookies
    const next = searchParams.get("next") || "/home";
    const code = searchParams.get("code");
    console.log("[AuthCallback] code:", code ? "present" : "missing", "next:", next);
    supabase.auth
      .getSession()
      .then(
        ({
          data: { session },
          error,
        }: {
          data: { session: import("@supabase/supabase-js").Session | null };
          error: import("@supabase/supabase-js").AuthError | null;
        }) => {
          console.log("[AuthCallback] session:", session ? "found" : "null", "error:", error?.message);
          if (session) {
            router.replace(next);
          } else {
            router.replace(
              "/auth/signin?error=" +
                encodeURIComponent(error?.message || "Session not found after OAuth")
            );
          }
        }
      )
      .catch((err) => {
        console.error("[AuthCallback] getSession failed:", err);
        router.replace(
          "/auth/signin?error=" + encodeURIComponent(String(err))
        );
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">
              Completing sign in...
            </p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
