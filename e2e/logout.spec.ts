import { test, expect } from "@playwright/test";

// Runs in its own project AFTER all shared-session tests:
// signOut() revokes the Supabase server session, so it must be the last
// consumer of the shared e2e/.auth/user.json storageState cookie.
test.describe("Logout", () => {
  test("signs out via header dropdown", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });

    // Retry in case the header re-renders (element detached) during client nav
    // Avatar letter = first letter of the signed-in email (unknown a-priori)
    const avatarButton = page
      .locator("header")
      .getByRole("button", { name: /^[ก-ฮA-Z]$/ });
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
