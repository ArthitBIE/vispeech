import { test, expect } from "@playwright/test";

test.describe("Auth sign-in flow", () => {
  test("loads /auth/signin with login form elements", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText("Login");
  });

  test("renders OAuth error from ?error= query param in the alert box", async ({
    page,
  }) => {
    await page.goto(
      "/auth/signin?error=" +
        encodeURIComponent("Session not found after OAuth")
    );
    // Scope to the form — Next's route announcer also carries role="alert"
    await expect(page.locator('form [role="alert"]')).toContainText(
      "Session not found after OAuth"
    );
  });

  test("signs in with valid credentials and redirects away from /auth", async ({
    page,
  }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(
      !email || !password,
      "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set"
    );

    await page.goto("/auth/signin");
    await page.fill("#email", email!);
    await page.fill("#password", password!);
    await page.click('button[type="submit"]');

    // Wait for successful auth redirect (should leave /auth path)
    await page.waitForURL(/^(?!.*\/auth)/, { timeout: 15000 });
    expect(page.url()).not.toContain("/auth");
  });
});
