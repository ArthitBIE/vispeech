import { test, expect } from "@playwright/test";

/**
 * Regression: protected routes were reachable with a hand-crafted cookie.
 *
 * `src/proxy.ts` decodes the Supabase session cookie and checks that a `sub`
 * claim is present. It does not, and cannot cheaply, verify the JWT signature
 * or the expiry -- that is a network round-trip on every request. So the proxy
 * is an optimistic redirect, and anyone who sends
 *
 *   Cookie: sb-<anything>-auth-token=base64-<{"access_token":"<unsigned jwt>"}>
 *
 * satisfies it. Measured against a running dev server before the fix:
 * /dashboard and /settings both returned 200 with a forged cookie, and so did
 * a session whose `exp` was in 2001.
 *
 * The fix adds `verifySession()` (src/lib/auth/dal.ts) to the three protected
 * layouts. It calls `supabase.auth.getUser()`, which validates the token
 * server-side, so forged and expired tokens resolve to null and redirect.
 *
 * These tests use raw `request` rather than a browser context so they assert
 * on the redirect itself instead of on rendered UI, and so no real session
 * cookie is involved.
 */

const PROTECTED_PATHS = [
  "/",
  "/home",
  "/dashboard",
  "/settings",
  "/practice/session",
  "/summary",
];

function b64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

/** An unsigned JWT: correct shape, worthless signature. */
function forgedJwt(sub: string, exp?: number): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ sub, aud: "authenticated", ...(exp ? { exp } : {}) })
  );
  return `${header}.${payload}.not-a-real-signature`;
}

/** Wrap a token the way @supabase/ssr serializes a session into a cookie. */
function sessionCookieValue(jwt: string, expiresAt?: number): string {
  return `base64-${b64url(
    JSON.stringify({
      access_token: jwt,
      token_type: "bearer",
      ...(expiresAt ? { expires_at: expiresAt } : {}),
    })
  )}`;
}

/**
 * Follow the redirect chain by hand and return where it lands.
 *
 * Asserting on a single hop is too literal: `/` legitimately bounces through
 * `/home` (the proxy's authenticated-landing redirect) before the layout's
 * real session check rejects it. The property that actually matters is that an
 * unauthorized visitor never *arrives* at a protected page, so assert on the
 * end of the chain, and separately that no hop ever rendered a 200.
 */
async function followChain(
  request: import("@playwright/test").APIRequestContext,
  path: string,
  cookie?: string
): Promise<{ finalPath: string; hops: string[]; renderedStatus: number }> {
  const hops: string[] = [];
  let current = path;

  for (let i = 0; i < 6; i++) {
    const res = await request.get(current, {
      maxRedirects: 0,
      ...(cookie ? { headers: { cookie } } : {}),
    });

    if (res.status() < 300 || res.status() >= 400) {
      return { finalPath: current, hops, renderedStatus: res.status() };
    }

    const location = res.headers()["location"];
    hops.push(`${current} -> ${location}`);
    current = new URL(location, "http://localhost:3000").pathname;
  }

  throw new Error(`redirect loop for ${path}: ${hops.join(", ")}`);
}

test.describe("unauthenticated access to protected routes", () => {
  for (const path of PROTECTED_PATHS) {
    test(`${path} redirects to signin with no cookie`, async ({ request }) => {
      const { finalPath, hops } = await followChain(request, path);
      expect(finalPath, `chain was: ${hops.join(", ")}`).toBe("/auth/signin");
    });
  }

  for (const path of PROTECTED_PATHS) {
    test(`${path} redirects to signin with a forged cookie`, async ({
      request,
    }) => {
      const cookie = `sb-forged-auth-token=${sessionCookieValue(
        forgedJwt("00000000-0000-0000-0000-000000000000")
      )}`;

      // No hop may render: an unsigned token must never produce a page.
      const first = await request.get(path, {
        maxRedirects: 0,
        headers: { cookie },
      });
      expect(
        first.status(),
        `${path} must not render for an unsigned token`
      ).toBe(307);

      const { finalPath, hops } = await followChain(request, path, cookie);
      expect(finalPath, `chain was: ${hops.join(", ")}`).toBe("/auth/signin");
    });
  }

  test("an expired session is rejected", async ({ request }) => {
    const past = 1000000000; // 2001-09-09
    const cookie = `sb-expired-auth-token=${sessionCookieValue(
      forgedJwt("11111111-1111-1111-1111-111111111111", past),
      past
    )}`;

    const { finalPath, hops } = await followChain(
      request,
      "/dashboard",
      cookie
    );
    expect(finalPath, `chain was: ${hops.join(", ")}`).toBe("/auth/signin");
  });
});
