import { test, expect } from "@playwright/test";

test.describe("Dashboard page", () => {
  test("shows word table after login and /api/words returns 200", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;

    test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    await page.goto("/auth");
    await page.fill('[data-testid="login-email"]', email!);
    await page.fill('[data-testid="login-password"]', password!);
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    const wordsRes = page.waitForResponse(
      (res) => res.url().includes("/api/words") && res.status() === 200,
    );
    await page.goto("/dashboard");
    await wordsRes;

    await expect(page.locator('[data-testid="dashboard-word-card"]').first()).toBeVisible({
      timeout: 10000,
    });

    const wordCards = page.locator('[data-testid="dashboard-word-card"]');
    const count = await wordCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking a word navigates to practice page", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;

    test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    await page.goto("/auth");
    await page.fill('[data-testid="login-email"]', email!);
    await page.fill('[data-testid="login-password"]', password!);
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    const firstLink = page.locator('[data-testid="dashboard-word-card"] a').first();
    await expect(firstLink).toBeVisible({ timeout: 10000 });
    const href = await firstLink.getAttribute("href");

    await firstLink.click();
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
      timeout: 10000,
    });
  });
});
