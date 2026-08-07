import { expect, type Page } from "@playwright/test";

/**
 * The dashboard fetches the latest practice session on mount and opens the
 * results sidebar by itself when one exists. That is deliberate product
 * behaviour, not a bug, but it races anything a test wants to click: the
 * sidebar renders a full-screen `fixed inset-0 z-40` overlay, and while it is
 * up every click on the page below is intercepted.
 *
 * Whether the auto-open lands before or after the test's first click depends
 * on how fast /api/practice-sessions answers, which is why the failure was
 * intermittent and got much more frequent under parallel workers. Observed
 * directly: on the runs that failed, the overlay was already present before
 * the click, and Playwright reported
 *   <div class="fixed inset-0 z-40 ..."> intercepts pointer events
 *
 * Waiting for the auto-open and dismissing it makes the starting state
 * deterministic. Do not replace this with a fixed timeout: the point is to
 * synchronise on the fetch, not to hope it has finished.
 */
export async function settleDashboardAutoSidebar(page: Page) {
  const sidebar = page.locator("aside.fixed");

  // Give the mount fetch a bounded chance to open the sidebar. A dashboard
  // with no practice history never opens it, so absence is a valid state and
  // must not fail the helper.
  try {
    await expect(sidebar).toBeVisible({ timeout: 4000 });
  } catch {
    return; // never auto-opened; nothing to dismiss
  }

  await sidebar.getByRole("button", { name: "ปิด", exact: true }).click();
  await expect(sidebar).toBeHidden({ timeout: 5000 });

  // The overlay is what actually blocks clicks, so assert on it rather than
  // trusting that hiding the aside took the overlay with it.
  await expect(page.locator("div.fixed.inset-0.z-40")).toHaveCount(0);
}
