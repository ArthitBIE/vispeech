import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserIdFromCookies } from "@/lib/auth/session-cookie";

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

  const userId = getUserIdFromCookies(request.cookies.getAll());

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
