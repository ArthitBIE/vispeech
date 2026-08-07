import { test, expect } from "@playwright/test";

/**
 * Regression: the dashboard's mount effect fetches the latest practice results
 * and then unconditionally calls setSidebarOpen(true). If the user closes the
 * sidebar before that request resolves, the late setState reopens it.
 *
 * Only the FIRST (mount) request is delayed. Delaying every request would let
 * the mount effect resolve before the user can click, which hides the bug --
 * that mistake made an earlier version of this test pass against broken code.
 */
test("closing the sidebar wins against the in-flight auto-open fetch", async ({
  page,
}) => {
  let seen = 0;
  await page.route("**/api/practice-sessions**", async (route) => {
    if (route.request().method() === "GET") {
      seen += 1;
      if (seen === 1) {
        // Hold the mount fetch open past the user's close click.
        await new Promise((r) => setTimeout(r, 6000));
      }
    }
    await route.fallback();
  });

  await page.goto("/dashboard");

  const heading = page.locator("h1:has-text('ผลการฝึกแต่ละคำ')");

  // Open it deliberately, via the second (fast) fetch.
  const summaryBtn = page.locator('button:has-text("สรุปผล")').first();
  await expect(summaryBtn).toBeVisible({ timeout: 15000 });
  await summaryBtn.click();
  await expect(heading).toBeVisible({ timeout: 15000 });

  // Close it while the mount fetch is still in flight.
  await page
    .locator("aside")
    .getByRole("button", { name: "ปิด", exact: true })
    .click();
  await expect(heading).not.toBeVisible({ timeout: 5000 });

  // It must STAY closed once the delayed mount fetch lands.
  await page.waitForTimeout(7000);
  await expect(
    heading,
    "sidebar reopened by itself after the user closed it"
  ).not.toBeVisible();
});
