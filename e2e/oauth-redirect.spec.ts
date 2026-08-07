import { test, expect } from "@playwright/test";

/**
 * App-layer OAuth verification.
 *
 * The live allow-list probe proves the CONFIG accepts localhost. It cannot prove
 * the APP asks for the right thing. These tests drive the real browser and assert
 * on what actually leaves it.
 */

test.describe("OAuth app layer", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Google button sends a clean redirectTo with no query string", async ({
    page,
  }) => {
    await page.goto("/auth/signin");

    // Capture the outbound Google URL instead of following it.
    let authorizeUrl: string | null = null;
    await page.route("**/auth/v1/authorize**", async (route) => {
      authorizeUrl = route.request().url();
      await route.abort();
    });

    await page.getByRole("button", { name: /Google/i }).click();
    await expect.poll(() => authorizeUrl, { timeout: 15000 }).not.toBeNull();

    const redirectTo = new URL(authorizeUrl!).searchParams.get("redirect_to");
    expect(redirectTo, "redirect_to must be present").toBeTruthy();

    // The original bug: a query string made the exact-match allow-list miss,
    // silently sending users to the production Site URL.
    expect(redirectTo).toBe("http://localhost:3000/auth/callback");
    expect(redirectTo).not.toContain("?");
    expect(redirectTo).not.toContain("next=");

    // PKCE, not implicit -- an implicit flow would return tokens in the fragment.
    const u = new URL(authorizeUrl!);
    expect(u.searchParams.get("code_challenge")).toBeTruthy();
    expect(u.searchParams.get("code_challenge_method")).toBe("s256");
  });

  test("callback does not race the SDK for the one-time PKCE code", async ({
    page,
  }) => {
    // If the page called exchangeCodeForSession immediately it would consume the
    // verifier and fail. It must wait for the SDK instead.
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await page.goto("/auth/callback?code=fake-code-not-a-real-grant");

    // With an invalid code no session appears, so it must land back on signin
    // with an error rather than hanging on the spinner forever.
    await page.waitForURL(/\/auth\/signin/, { timeout: 15000 });

    // The specific regression: losing the race produced this message even when
    // sign-in had actually succeeded.
    const raced = errors.some((e) => /code verifier/i.test(e));
    expect(raced, `PKCE verifier race detected: ${errors.join(" | ")}`).toBe(
      false
    );
  });

  test("provider error is surfaced, not swallowed", async ({ page }) => {
    await page.goto(
      "/auth/callback?error=access_denied&error_description=User+denied+access"
    );
    await page.waitForURL(/\/auth\/signin/, { timeout: 15000 });
    expect(page.url()).toContain("error=");
    expect(decodeURIComponent(page.url())).toContain("User denied access");
  });
});
