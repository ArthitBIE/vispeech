import { test, expect } from "@playwright/test";

test.describe("Sidebar navigation", () => {
  const SIDEBAR_LINKS = [
    { label: "หน้าหลัก", href: "/home" },
    { label: "ความก้าวหน้า", href: "/dashboard" },
    { label: "การตั้งค่า", href: "/settings" },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
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

  test("signs out via header dropdown", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Retry in case the header re-renders (element detached) during client nav
    const avatarButton = page
      .locator("header")
      .getByRole("button", { name: "ก" });
    await expect(async () => {
      await avatarButton.click();
      await expect(page.locator('[role="menu"]')).toBeVisible({
        timeout: 3000,
      });
    }).toPass({ timeout: 15000 });

    await page
      .locator('[role="menuitem"]')
      .filter({ hasText: "ออกจากระบบ" })
      .click();

    await page.waitForURL(/\/auth/, { timeout: 10000 });
  });
});
