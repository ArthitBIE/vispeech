import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight JWT payload decode (no verification — presence check only)
function getUserId(cookies: ReturnType<NextRequest["cookies"]["getAll"]>): string | null {
  for (const { name, value } of cookies) {
    if (!name.endsWith("-auth-token") || !value) continue;
    try {
      const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.sub ?? null;
    } catch {
      // malformed token — treat as unauthenticated
    }
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // Fast pass-through: API routes, auth pages, _next assets, static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return response;
  }

  const userId = getUserId(request.cookies.getAll());

  if (!userId) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
