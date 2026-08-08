import { test, expect, type Page } from "@playwright/test";
import { settleDashboardAutoSidebar } from "./helpers/dashboard";

test.describe("Dashboard progress page", () => {
  // Scope to the page heading by name. A bare locator("h1") is ambiguous:
  // PracticeResultSidebar renders its own <h1>, and the dashboard opens that
  // sidebar automatically once the latest-session fetch resolves, so an
  // unqualified h1 intermittently matches two elements and trips strict mode.
  const pageHeading = (page: Page) =>
    page.getByRole("heading", { level: 1, name: "ความก้าวหน้าทั้งหมด" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Wait for page to load (might show skeleton first)
    await expect(pageHeading(page)).toBeVisible({ timeout: 15000 });
    // Same auto-open sidebar the comment above describes: its z-40 overlay
    // also intercepts the lesson-card clicks below.
    await settleDashboardAutoSidebar(page);
  });

  test("shows heading and layout", async ({ page }) => {
    await expect(pageHeading(page)).toHaveText("ความก้าวหน้าทั้งหมด");
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
