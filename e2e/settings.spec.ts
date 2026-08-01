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
    await expect(page.locator("text=Enable Microphone Input")).toBeVisible();
    await expect(
      page.locator("text=Allow the app to access your microphone")
    ).toBeVisible();

    // The switch should be present and checked by default
    const toggle = page.locator('button[role="switch"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toBeChecked();
  });

  test("shows input device selector", async ({ page }) => {
    await expect(page.getByText("Input device", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Choose your input device", { exact: true })
    ).toBeVisible();

    // Device selector combobox is present
    const selectTrigger = page.locator('button[role="combobox"]');
    await expect(selectTrigger).toBeVisible();
  });

  test("shows microphone sensitivity slider", async ({ page }) => {
    await expect(page.locator("text=Microphone sensitivity")).toBeVisible();
    await expect(
      page.locator("text=Adjust how sensitive the mic is")
    ).toBeVisible();
    await expect(page.locator("text=Adjust sensitivity level")).toBeVisible();

    // Slider is present and shows value
    const slider = page.locator('span[role="slider"]');
    await expect(slider).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=60%").first()).toBeVisible();
  });

  test("shows test microphone button", async ({ page }) => {
    await expect(page.locator("text=Test microphone")).toBeVisible();
    await expect(
      page.locator("text=Make sure your selected device is working properly")
    ).toBeVisible();

    const testButton = page.locator('button:has-text("Start Test")');
    await expect(testButton).toBeVisible();
  });

  test("device selector lists available microphones", async ({ page }) => {
    // Headless browsers expose a single default "Microphone" device
    const selectTrigger = page.locator('button[role="combobox"]');
    await selectTrigger.click();
    await expect(page.locator('[role="listbox"]')).toBeVisible({
      timeout: 3000,
    });
    const option = page.locator('[role="option"]').first();
    await expect(option).toBeVisible({ timeout: 3000 });
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
