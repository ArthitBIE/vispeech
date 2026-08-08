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

    if (error) {
      const msg = errorDescription || error;
      router.replace(`/auth/signin?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (!supabase?.auth) {
      console.error("[AuthCallback] supabase client or auth is NULL");
      router.replace("/auth/signin?error=Supabase+not+configured");
      return;
    }

    // PKCE flow.
    //
    // `createBrowserClient` (@supabase/ssr) sets `detectSessionInUrl: true` by
    // default, so the SDK exchanges the `?code=` itself on load and consumes the
    // one-time PKCE verifier. Calling `exchangeCodeForSession` here as well loses
    // that race and fails with "PKCE code verifier not found in storage" even
    // though sign-in actually succeeded.
    //
    // So: wait for the SDK's exchange to land instead of competing with it, and
    // only fall back to a manual exchange if the SDK never picked the code up.
    if (code) {
      let settled = false;

      const finish = (session: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        subscription?.unsubscribe();

        if (session) {
          router.replace(next);
        } else {
          console.error("[AuthCallback] no session after PKCE exchange");
          router.replace(
            "/auth/signin?error=" +
              encodeURIComponent("OAuth code exchange failed")
          );
        }
      };

      // The SDK fires SIGNED_IN once its internal exchange completes.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event: string, session: unknown) => {
          if (session) finish(session);
        }
      );

      // It may also have completed before this effect ran.
      supabase.auth
        .getSession()
        .then(
          ({
            data: { session },
          }: {
            data: { session: import("@supabase/supabase-js").Session | null };
          }) => {
            if (session) finish(session);
          }
        );

      // Fallback: SDK never consumed the code, so do the exchange ourselves.
      const timeoutId = setTimeout(async () => {
        if (settled) return;
        try {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            const { data: retry } = await supabase.auth.getSession();
            finish(retry.session);
          } else {
            finish(data.session);
          }
        } catch {
          const { data: retry } = await supabase.auth.getSession();
          finish(retry.session);
        }
      }, 2000);

      return () => {
        clearTimeout(timeoutId);
        subscription?.unsubscribe();
      };
    } else {
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
