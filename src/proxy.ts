import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = NextResponse.next({ request });

  if (
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://placeholder.supabase.co"
  ) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    });

    const { pathname } = request.nextUrl;

    // API routes, auth pages, and _next assets pass through without auth check
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/_next")
    ) {
      return response;
    }

    // Fast local auth check (no network round-trip to Supabase Auth)
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims?.sub ? { id: data.claims.sub } : null;

    // Public static assets (/google-icon.svg, /title-top-left.svg) are requested
    // by /auth pages that unauthenticated visitors must render; without this the
    // proxy 302s them to /auth/signin, breaking the Google icon and producing a
    // "preloaded but not used" warning. Anchored to the end of the pathname so no
    // real route (none contain dots) is affected and auth-gating is unchanged.
    if (/\.[a-z0-9]+$/i.test(pathname)) {
      return response;
    }

    if (!user && !pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    if (user && (pathname.startsWith("/auth") || pathname === "/")) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
