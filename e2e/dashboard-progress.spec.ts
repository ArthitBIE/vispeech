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

  test("renders 3 lesson cards with correct titles", async ({ page }) => {
    const lessonTitles = ["คำศัพท์ง่าย", "เสียงสระ", "บทสนทนา"];
    for (const title of lessonTitles) {
      const card = page.locator("h2").filter({ hasText: title });
      await expect(card).toBeVisible({ timeout: 5000 });
    }
  });

  test("lesson cards show progress bars", async ({ page }) => {
    // Progress bars are div elements with rounded-full bg-black
    const progressFills = page.locator("div.rounded-full.bg-black");
    const count = await progressFills.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("completed lesson shows accuracy badge", async ({ page }) => {
    // The first lesson "คำศัพท์ง่าย" should display an accuracy badge
    // Search for the percentage text near the lesson card area
    const badgeText = page.locator("text=84.6%").first();
    await expect(badgeText).toBeVisible({ timeout: 5000 });
  });

  test('clicking "เริ่มการฝึก" on a lesson navigates to /practice/session', async ({
    page,
  }) => {
    // Find a "เริ่มการฝึก" button inside a lesson card
    const startButton = page
      .locator("button")
      .filter({ hasText: "เริ่มการฝึก" })
      .first();
    await expect(startButton).toBeVisible({ timeout: 5000 });
    await startButton.click();
    await page.waitForURL(/\/practice\/session/, { timeout: 10000 });
  });

  test('completed lesson shows "สรุปผล" and "เริ่มการฝึกซ้ำ" buttons', async ({
    page,
  }) => {
    // The first card (คำศัพท์ง่าย) is completed (highlighted: true)
    // It should show "สรุปผล" and "เริ่มการฝึกซ้ำ" buttons
    await expect(page.locator("button:has-text('สรุปผล')").first()).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator("button:has-text('เริ่มการฝึกซ้ำ')").first(),
    ).toBeVisible({ timeout: 5000 });
  });
});
