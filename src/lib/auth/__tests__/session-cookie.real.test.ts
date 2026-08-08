import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getUserIdFromCookies } from "../session-cookie";

/**
 * Guards the helper against the REAL cookie Supabase writes, not just synthetic
 * fixtures. The unit suite builds its own inputs, so it can only prove the code
 * is self-consistent -- if our assumption about the cookie's shape were wrong,
 * every synthetic test would still pass.
 *
 * Skips when the Playwright auth fixture has not been generated.
 */
const fixture = join(process.cwd(), "e2e/.auth/user.json");

describe("session-cookie against the real Supabase cookie", () => {
  it.skipIf(!existsSync(fixture))(
    "extracts a user id from the live storageState cookie",
    () => {
      const state = JSON.parse(readFileSync(fixture, "utf8"));
      const cookies = (state.cookies ?? []).map(
        (c: { name: string; value: string }) => ({
          name: c.name,
          value: c.value,
        })
      );

      const authCookies = cookies.filter((c: { name: string }) =>
        c.name.includes("auth-token")
      );
      expect(
        authCookies.length,
        "fixture should contain a Supabase auth cookie"
      ).toBeGreaterThan(0);

      // The shape assumption the whole fix rests on.
      expect(authCookies[0].value.startsWith("base64-")).toBe(true);

      const userId = getUserIdFromCookies(cookies);
      expect(
        userId,
        "must resolve a user id from the real cookie"
      ).toBeTruthy();
      expect(userId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    }
  );

  it.skipIf(!existsSync(fixture))(
    "resolves the same id when that real cookie is split into chunks",
    () => {
      // Google OAuth sessions carry provider_token and exceed the ~4KB limit,
      // so @supabase/ssr splits them. The email/password fixture stays under
      // the limit, so we reproduce the split from real bytes.
      const state = JSON.parse(readFileSync(fixture, "utf8"));
      const auth = (state.cookies ?? []).find((c: { name: string }) =>
        c.name.includes("auth-token")
      );
      expect(auth).toBeTruthy();

      const whole = getUserIdFromCookies([
        { name: auth.name, value: auth.value },
      ]);

      const size = Math.ceil(auth.value.length / 3);
      const chunked = [
        { name: `${auth.name}.0`, value: auth.value.slice(0, size) },
        { name: `${auth.name}.1`, value: auth.value.slice(size, size * 2) },
        { name: `${auth.name}.2`, value: auth.value.slice(size * 2) },
      ];

      expect(getUserIdFromCookies(chunked)).toBe(whole);

      // Out-of-order delivery must still reassemble correctly.
      expect(getUserIdFromCookies([chunked[2], chunked[0], chunked[1]])).toBe(
        whole
      );

      // A missing chunk must NOT authenticate.
      expect(getUserIdFromCookies([chunked[0], chunked[1]])).toBeNull();
    }
  );
});
