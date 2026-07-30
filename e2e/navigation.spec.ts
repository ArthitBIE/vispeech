import { test, expect } from "@playwright/test";

test.describe("Sidebar navigation", () => {
  const SIDEBAR_LINKS = [
    { label: "หน้าแรก", href: "/home" },
    { label: "แดชบอร์ด", href: "/dashboard" },
    { label: "ฝึกฝน", href: "/practice/session" },
    { label: "สรุปผล", href: "/summary" },
    { label: "ตั้งค่า", href: "/settings" },
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

      // Verify no 404 or error state — page content loaded
      await expect(page.locator("h1, h2").first()).toBeVisible({
        timeout: 10000,
      });
      // Check we're not on a Next.js error page
      await expect(page.locator("text=404").first()).not.toBeVisible({
        timeout: 2000,
      });
    });
  }
});
