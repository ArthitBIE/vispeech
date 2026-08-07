"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Suspense } from "react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // useRef to prevent double-run in React 19 StrictMode (effects fire twice in dev)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/home";

    console.log("[AuthCallback] === OAuth callback fired ===");
    console.log("[AuthCallback] full URL:", window.location.href);
    console.log("[AuthCallback] error:", error);
    console.log("[AuthCallback] error_description:", errorDescription);
    console.log(
      "[AuthCallback] code:",
      code ? `${code.slice(0, 10)}... (truncated)` : "MISSING"
    );
    console.log("[AuthCallback] next:", next);
    console.log(
      "[AuthCallback] supabase client:",
      supabase ? "present" : "NULL"
    );
    console.log(
      "[AuthCallback] supabase.auth:",
      supabase?.auth ? "present" : "NULL"
    );

    if (error) {
      console.log(
        "[AuthCallback] error path — redirecting to signin with error"
      );
      const msg = errorDescription || error;
      router.replace(`/auth/signin?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (!supabase?.auth) {
      console.error("[AuthCallback] supabase client or auth is NULL");
      router.replace("/auth/signin?error=Supabase+not+configured");
      return;
    }

    // PKCE flow: exchange the authorization code for a session
    if (code) {
      console.log(
        "[AuthCallback] PKCE code found — calling exchangeCodeForSession()"
      );
      supabase.auth
        .exchangeCodeForSession(code)
        .then(
          ({
            error,
          }: {
            error: import("@supabase/supabase-js").AuthError | null;
          }) => {
            if (error) {
              console.error(
                "[AuthCallback] exchangeCodeForSession FAILED:",
                error.message
              );
              router.replace(
                "/auth/signin?error=" +
                  encodeURIComponent(
                    error.message || "OAuth code exchange failed"
                  )
              );
            } else {
              console.log(
                "[AuthCallback] exchangeCodeForSession SUCCESS — redirecting to",
                next
              );
              router.replace(next);
            }
          }
        )
        .catch((err: unknown) => {
          console.error("[AuthCallback] exchangeCodeForSession threw:", err);
          router.replace(
            "/auth/signin?error=" + encodeURIComponent(String(err))
          );
        });
    } else {
      console.log(
        "[AuthCallback] no PKCE code — checking for existing session"
      );
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
            console.log(
              "[AuthCallback] getSession result:",
              session ? "found" : "null",
              "error:",
              error?.message
            );
            if (session) {
              router.replace(next);
            } else {
              router.replace(
                "/auth/signin?error=" +
                  encodeURIComponent(
                    error?.message || "Session not found after OAuth"
                  )
              );
            }
          }
        );
    }
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
