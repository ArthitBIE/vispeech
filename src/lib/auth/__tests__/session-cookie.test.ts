import { describe, it, expect } from "vitest";
import { decodeJwtSub, getUserIdFromCookies } from "../session-cookie";

const USER_ID = "6772beee-a982-4fcd-9178-2a5c1cd0cdf4";

function b64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Build an unsigned JWT whose payload carries `sub`. */
function makeJwt(sub: string): string {
  const header = b64url(JSON.stringify({ alg: "ES256", typ: "JWT" }));
  const payload = b64url(JSON.stringify({ sub, aud: "authenticated" }));
  return `${header}.${payload}.signature`;
}

/** Mimic how @supabase/ssr serializes a session into a cookie value. */
function makeSessionCookieValue(sub: string): string {
  const session = { access_token: makeJwt(sub), token_type: "bearer" };
  return `base64-${b64url(JSON.stringify(session))}`;
}

describe("decodeJwtSub", () => {
  it("extracts sub from a JWT payload", () => {
    expect(decodeJwtSub(makeJwt(USER_ID))).toBe(USER_ID);
  });

  it("returns null for a non-JWT string", () => {
    expect(decodeJwtSub("not-a-jwt")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(decodeJwtSub("")).toBeNull();
  });
});

describe("getUserIdFromCookies", () => {
  it("returns null when there are no cookies", () => {
    expect(getUserIdFromCookies([])).toBeNull();
  });

  it("ignores unrelated cookies", () => {
    expect(
      getUserIdFromCookies([{ name: "vispeech.settings", value: "{}" }])
    ).toBeNull();
  });

  // Regression: the proxy previously assumed a single cookie holding a bare
  // JWT, so real @supabase/ssr sessions never authenticated and users were
  // redirected back to /auth/signin right after a successful Google login.
  it("reads a single base64- session cookie", () => {
    expect(
      getUserIdFromCookies([
        {
          name: "sb-qkgaqvtlspomtmcyqpet-auth-token",
          value: makeSessionCookieValue(USER_ID),
        },
      ])
    ).toBe(USER_ID);
  });

  it("reassembles chunked .0 / .1 session cookies", () => {
    const full = makeSessionCookieValue(USER_ID);
    const mid = Math.floor(full.length / 2);

    expect(
      getUserIdFromCookies([
        {
          name: "sb-qkgaqvtlspomtmcyqpet-auth-token.0",
          value: full.slice(0, mid),
        },
        {
          name: "sb-qkgaqvtlspomtmcyqpet-auth-token.1",
          value: full.slice(mid),
        },
      ])
    ).toBe(USER_ID);
  });

  it("reassembles chunks supplied out of order", () => {
    const full = makeSessionCookieValue(USER_ID);
    const mid = Math.floor(full.length / 2);

    expect(
      getUserIdFromCookies([
        {
          name: "sb-qkgaqvtlspomtmcyqpet-auth-token.1",
          value: full.slice(mid),
        },
        {
          name: "sb-qkgaqvtlspomtmcyqpet-auth-token.0",
          value: full.slice(0, mid),
        },
      ])
    ).toBe(USER_ID);
  });

  it("orders chunks numerically beyond index 9", () => {
    const full = makeSessionCookieValue(USER_ID);
    const size = Math.ceil(full.length / 11);
    const cookies = Array.from({ length: 11 }, (_, i) => ({
      name: `sb-ref-auth-token.${i}`,
      value: full.slice(i * size, (i + 1) * size),
    }));

    // Lexicographic sorting would place ".10" before ".2" and corrupt the value.
    expect(getUserIdFromCookies(cookies.reverse())).toBe(USER_ID);
  });

  it("supports a plain JSON session cookie", () => {
    expect(
      getUserIdFromCookies([
        {
          name: "sb-ref-auth-token",
          value: JSON.stringify({ access_token: makeJwt(USER_ID) }),
        },
      ])
    ).toBe(USER_ID);
  });

  it("supports a bare JWT cookie", () => {
    expect(
      getUserIdFromCookies([
        { name: "sb-ref-auth-token", value: makeJwt(USER_ID) },
      ])
    ).toBe(USER_ID);
  });

  it("returns null for a malformed session cookie", () => {
    expect(
      getUserIdFromCookies([
        { name: "sb-ref-auth-token", value: "base64-@@@not-valid@@@" },
      ])
    ).toBeNull();
  });

  it("returns null when a chunk is missing", () => {
    const full = makeSessionCookieValue(USER_ID);
    expect(
      getUserIdFromCookies([
        { name: "sb-ref-auth-token.0", value: full.slice(0, full.length / 2) },
      ])
    ).toBeNull();
  });

  it("ignores an empty cookie value", () => {
    expect(
      getUserIdFromCookies([{ name: "sb-ref-auth-token", value: "" }])
    ).toBeNull();
  });
});
