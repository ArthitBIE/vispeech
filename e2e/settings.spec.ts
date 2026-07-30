import { test, expect } from "@playwright/test";

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows page heading", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("System Settings");
  });

  test("shows microphone toggle switch", async ({ page }) => {
    await expect(
      page.locator("text=Enable Microphone Input"),
    ).toBeVisible();
    await expect(
      page.locator("text=Allow the app to access your microphone"),
    ).toBeVisible();

    // The switch should be present and checked by default
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeChecked();
  });

  test("shows input device selector", async ({ page }) => {
    await expect(page.locator("text=Input device")).toBeVisible();
    await expect(
      page.locator("text=Choose your input device"),
    ).toBeVisible();

    // Device selector
    const selectTrigger = page.locator(
      'button:has-text("MacBook Pro2019 Inter")',
    );
    await expect(selectTrigger).toBeVisible();
  });

  test("shows microphone sensitivity slider", async ({ page }) => {
    await expect(
      page.locator("text=Microphone sensitivity"),
    ).toBeVisible();
    await expect(
      page.locator("text=Adjust how sensitive the mic is"),
    ).toBeVisible();
    await expect(
      page.locator("text=Adjust sensitivity level"),
    ).toBeVisible();

    // Slider is present and shows value
    const slider = page.locator('span[role="slider"]');
    await expect(slider).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=60%").first()).toBeVisible();
  });

  test("shows test microphone button", async ({ page }) => {
    await expect(
      page.locator("text=Test microphone"),
    ).toBeVisible();
    await expect(
      page.locator("text=Make sure your selected device is working"),
    ).toBeVisible();

    const testButton = page.locator('button:has-text("Start Test")');
    await expect(testButton).toBeVisible();
  });

  test("device selector opens dropdown with options", async ({ page }) => {
    // Click the device selector to open dropdown
    const selectTrigger = page.locator(
      'button:has-text("MacBook Pro2019 Inter")',
    );
    await selectTrigger.click();

    // Dropdown options should appear
    await expect(
      page.locator('[role="option"]').filter({ hasText: "External Microphone" }),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.locator('[role="option"]').filter({ hasText: "AirPods Microphone" }),
    ).toBeVisible({ timeout: 3000 });
  });

  test("toggling mic switch updates state", async ({ page }) => {
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeChecked();

    // Click to toggle off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Toggle back on
    await toggle.click();
    await expect(toggle).toBeChecked();
  });
});
