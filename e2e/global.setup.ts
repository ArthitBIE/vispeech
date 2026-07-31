import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    console.error("Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD env vars");
    process.exit(1);
  }

  await page.goto("/auth/signin");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/^(?!.*\/auth)/, { timeout: 15000 });
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
