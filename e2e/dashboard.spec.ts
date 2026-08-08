import { test, expect, type Page } from "@playwright/test";
import { settleDashboardAutoSidebar } from "./helpers/dashboard";

test.describe("Dashboard results sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Wait for dashboard to load
    await expect(
      page.locator("h1:has-text('ความก้าวหน้าทั้งหมด')")
    ).toBeVisible({
      timeout: 15000,
    });
    // The dashboard opens the results sidebar by itself once the latest
    // session loads, and its overlay swallows the clicks below. Dismiss it so
    // each test starts from a known state.
    await settleDashboardAutoSidebar(page);
  });

  test("สรุปผล button opens results sidebar", async ({ page }) => {
    // Find a completed lesson card (has สรุปผล button)
    const summaryBtn = page.locator('button:has-text("สรุปผล")').first();
    await expect(summaryBtn).toBeVisible({ timeout: 5000 });
    await summaryBtn.click();

    // Sidebar should open
    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).toBeVisible({
      timeout: 5000,
    });
  });

  test("sidebar shows practiced word with score", async ({ page }) => {
    const summaryBtn = page.locator('button:has-text("สรุปผล")').first();
    await expect(summaryBtn).toBeVisible({ timeout: 5000 });
    await summaryBtn.click();

    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).toBeVisible({
      timeout: 5000,
    });

    // Should show at least one word result with score %
    await expect(
      page
        .locator("aside")
        .filter({ hasText: "ผลการฝึกแต่ละคำ" })
        .locator("text=/\\d+%/")
        .first()
    ).toBeVisible({
      timeout: 3000,
    });
  });

  test('"เริ่มการฝึกซ้ำ" in sidebar navigates to /practice/session', async ({
    page,
  }) => {
    const summaryBtn = page.locator('button:has-text("สรุปผล")').first();
    await expect(summaryBtn).toBeVisible({ timeout: 5000 });
    await summaryBtn.click();

    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).toBeVisible({
      timeout: 5000,
    });

    // Click "เริ่มการฝึกซ้ำ" in sidebar
    await page
      .locator("aside")
      .getByRole("button", { name: "เริ่มการฝึกซ้ำ" })
      .click();

    // Should navigate to practice session. PracticeWord is dynamically
    // imported (SessionContent.tsx), so the camera button waits on a chunk
    // fetch after navigation; 3s races that under parallel load.
    await page.waitForURL(/\/practice\/session/, { timeout: 10000 });
    await expect(page.getByTestId("practice-camera-btn")).toBeVisible({
      timeout: 15000,
    });
  });

  test('"ปิด" in sidebar closes sidebar', async ({ page }) => {
    const summaryBtn = page.locator('button:has-text("สรุปผล")').first();
    await expect(summaryBtn).toBeVisible({ timeout: 5000 });
    await summaryBtn.click();

    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).toBeVisible({
      timeout: 5000,
    });

    // Click "ปิด" in sidebar
    await page
      .locator("aside")
      .getByRole("button", { name: "ปิด", exact: true })
      .click();

    // Sidebar should close
    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).not.toBeVisible({
      timeout: 3000,
    });
  });
});
