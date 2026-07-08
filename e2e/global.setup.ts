import { test as setup, expect } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    console.error("Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD env vars");
    process.exit(1);
  }

  await page.goto("/auth");
  await page.fill('input[data-testid="login-email"]', email);
  await page.fill('input[data-testid="login-password"]', password);
  await page.click('button[data-testid="login-submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
