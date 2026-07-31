import { test, expect } from "@playwright/test";

test.describe("Dashboard progress page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Wait for page to load (might show skeleton first)
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows heading and layout", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("ความก้าวหน้าทั้งหมด");
  });

  test("renders at least one lesson card with title", async ({ page }) => {
    const cards = page.locator("h2");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const first = cards.first();
    await expect(first).toBeVisible({ timeout: 5000 });
  });

  test("lesson cards show progress bars", async ({ page }) => {
    const progressFills = page.locator("div.h-full.rounded-full.bg-foreground");
    const count = await progressFills.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('clicking "เริ่มการฝึก" on a lesson navigates to /practice/session', async ({
    page,
  }) => {
    const startButton = page
      .locator("button")
      .filter({ hasText: "เริ่มการฝึก" })
      .first();
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    await page.waitForURL(/\/practice\/session/, { timeout: 10000 });
  });
});
