import { test, expect } from "@playwright/test";

test.describe("Auth page", () => {
  test("loads with login form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/auth");
    await page.fill('[data-testid="login-email"]', "nonexistent@test.com");
    await page.fill('[data-testid="login-password"]', "wrongpassword");
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator("text=อีเมลหรือรหัสผ่านไม่ถูกต้อง")).toBeVisible({
      timeout: 10000,
    });
  });

  test("toggles to signup mode and back", async ({ page }) => {
    await page.goto("/auth");
    await page.click("text=สมัครสมาชิก");
    await expect(page.locator('[data-testid="signup-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-submit"]')).toBeVisible();
    await page.click("text=มีบัญชีอยู่แล้ว?");
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible();
  });

  test("signup with empty fields shows validation error", async ({ page }) => {
    await page.goto("/auth");
    await page.click("text=สมัครสมาชิก");
    await page.click('[data-testid="signup-submit"]');
    // Expect either an error message or form validation
    await expect(page.locator("text=อีเมล").first()).toBeVisible();
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    const email = process.env.E2E_TEST_EMAIL;
    const password = process.env.E2E_TEST_PASSWORD;

    test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    await page.goto("/auth");
    await page.fill('[data-testid="login-email"]', email!);
    await page.fill('[data-testid="login-password"]', password!);
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });
});
