import { test, expect, type Page } from "@playwright/test";

const resultsSidebar = (page: Page) => page.locator("text=ผลการฝึกแต่ละคำ");

async function practiceCurrentWord(page: Page) {
  // Start the camera. Headless has no real camera, so the demo fallback
  // feeds a non-zero mouth-open value within ~1s.
  const cameraBtn = page.getByTestId("practice-camera-btn");
  await expect(cameraBtn).toBeVisible({ timeout: 3000 });
  await cameraBtn.click();

  // Wait until the mouth-open meter shows a non-zero value.
  await expect(page.getByTestId("practice-mouth-open")).toContainText(
    /การเปิดปาก: [1-9]\d*%/,
    { timeout: 8000 }
  );

  // Submit the score for the current word.
  const submit = page.getByTestId("practice-submit");
  await expect(submit).toBeEnabled({ timeout: 5000 });
  await submit.click();

  await expect(page.getByTestId("score-card")).toBeVisible({ timeout: 8000 });
}

async function completeSession(page: Page) {
  const overlay = page.locator("div.fixed.inset-0.z-40");
  for (let i = 0; i < 60; i++) {
    if (
      (await resultsSidebar(page)
        .isVisible()
        .catch(() => false)) ||
      (await overlay.isVisible().catch(() => false))
    )
      return;
    const skip = page.locator('button:has-text("ข้ามคำ")').first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ timeout: 3000 }).catch(() => {});
      // Give the async finish flow a moment to open the sidebar.
      await page.waitForTimeout(300);
    } else {
      break;
    }
  }
  await expect(resultsSidebar(page)).toBeVisible({ timeout: 8000 });
}

test.describe("Practice session page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/practice/session");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });
  });

  test("shows heading with lesson title", async ({ page }) => {
    await expect(
      page.locator("h1:has-text('บทเรียน คำศัพท์ง่าย')")
    ).toBeVisible();
  });

  test("has 3-panel layout: lesson panel, word area, tips sidebar", async ({
    page,
  }) => {
    // Left panel: lesson info
    await expect(
      page.locator("h1:has-text('บทเรียน คำศัพท์ง่าย')")
    ).toBeVisible();
    // Right panel: tips
    await expect(page.locator("h2:has-text('Tips การฝึก')")).toBeVisible();
    // Center: word progress indicator
    await expect(
      page.locator("p", { hasText: /คำที่ \d+ \/ \d+/ })
    ).toBeVisible();
    // Center: camera section
    await expect(page.getByText("กล้อง", { exact: true })).toBeVisible();
    // Center: speech section
    await expect(page.getByText("เสียงพูด", { exact: true })).toBeVisible();
  });

  test("shows word display and progress dots", async ({ page }) => {
    // Word display with large text
    const wordText = page.locator("h1.text-5xl");
    await expect(wordText).toBeVisible();
    const wordContent = await wordText.textContent();
    expect(wordContent?.trim()).toBeTruthy();

    // Progress dots (small colored squares showing word progress)
    const dots = page.locator("div.flex.gap-2 > div.h-3.w-3");
    const dotCount = await dots.count();
    expect(dotCount).toBeGreaterThanOrEqual(1);

    // Word count indicator
    await expect(page.locator("text=/คำที่ \\d+ \\/ \\d+/")).toBeVisible();
  });

  test("shows word list in lesson panel with scores", async ({ page }) => {
    // List of words in lesson
    const wordItems = page
      .locator("aside section")
      .first()
      .locator("div.space-y-3 > div");
    const count = await wordItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("shows session progress bars in tips sidebar", async ({ page }) => {
    // Right sidebar has "เสียง" and "คำที่ฝึกแล้ว" sections
    await expect(page.getByText("เสียง", { exact: true })).toBeVisible();
    await expect(page.getByText("คำที่ฝึกแล้ว", { exact: true })).toBeVisible();

    // Progress bars
    const progressBars = page.locator('[role="progressbar"]');
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("shows motivational message per word index", async ({ page }) => {
    const messages = [
      "เริ่มต้นกัน! คำแรก",
      "ครึ่งทางแล้ว",
      "คำสุดท้าย",
      "คำที่",
      "จาก",
    ];
    // Check at least one motivational message pattern
    let found = false;
    for (const msg of messages) {
      const el = page.locator(`text=${msg}`).first();
      if (await el.isVisible().catch(() => false)) {
        found = true;
        break;
      }
    }
    expect(found).toBeTruthy();
  });

  test("practicing a word shows the score card", async ({ page }) => {
    await practiceCurrentWord(page);

    // Score card with per-criterion breakdown
    await expect(page.getByTestId("score-card")).toBeVisible();
    await expect(page.locator("text=ผลการฝึก")).toBeVisible();
    await expect(page.locator("text=คะแนนภาพ")).toBeVisible();
  });

  test("completing all words shows results sidebar", async ({ page }) => {
    await completeSession(page);

    // Should show accuracy badge
    await expect(page.getByText(/\d+%/).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("results sidebar shows practiced word with score", async ({ page }) => {
    // Capture the current word's text before practicing it
    const wordText = await page.locator("h1.text-5xl").textContent();
    const word = wordText?.trim();
    expect(word).toBeTruthy();

    await practiceCurrentWord(page);
    await completeSession(page);

    // The practiced word should be listed in the results sidebar
    const resultsAside = page
      .locator("aside")
      .filter({ hasText: "ผลการฝึกแต่ละคำ" });
    await expect(resultsAside.locator(`text=${word}`).first()).toBeVisible({
      timeout: 3000,
    });

    // Score badge exists
    await expect(resultsAside.getByText(/\d+%/).first()).toBeVisible();
  });

  test('"เริ่มการฝึกซ้ำ" restarts the session', async ({ page }) => {
    await completeSession(page);

    // Click "เริ่มการฝึกซ้ำ"
    await page.locator('button:has-text("เริ่มการฝึกซ้ำ")').click();

    // Sidebar should close and session should reset
    await expect(page.locator("text=ผลการฝึกแต่ละคำ")).not.toBeVisible({
      timeout: 5000,
    });

    // Practice button should be visible again
    await expect(page.getByTestId("practice-camera-btn")).toBeVisible({
      timeout: 3000,
    });
  });

  test('"ปิด" navigates to /summary', async ({ page }) => {
    await completeSession(page);

    // Click "ปิด"
    await page.locator('button:has-text("ปิด")').click();
    await page.waitForURL(/\/summary/, { timeout: 10000 });
  });
});
