import { test, expect } from "@playwright/test";

test.describe("Sidebar navigation", () => {
  const SIDEBAR_LINKS = [
    { label: "หน้าหลัก", href: "/home" },
    { label: "ความก้าวหน้า", href: "/dashboard" },
    { label: "การตั้งค่า", href: "/settings" },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { level: 1, name: "ความก้าวหน้าทั้งหมด" })
    ).toBeVisible({ timeout: 10000 });
  });

  for (const { label, href } of SIDEBAR_LINKS) {
    test(`sidebar "${label}" link navigates to ${href}`, async ({ page }) => {
      const link = page.locator(`aside a:has-text("${label}")`).first();
      await expect(link).toBeVisible({ timeout: 5000 });

      await link.click();
      await page.waitForURL(`**${href}`, { timeout: 10000 });

      await expect(page.locator("h1, h2").first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator("text=404").first()).not.toBeVisible({
        timeout: 2000,
      });
    });
  }
});
