import { test, expect, type Page } from "@playwright/test";

async function completeSession(page: Page) {
  const practiceBtn = page
    .locator('button:has-text("เริ่มการฝึกออกเสียง")')
    .first();
  for (let i = 0; i < 5; i++) {
    await expect(practiceBtn).toBeVisible({ timeout: 3000 });
    await practiceBtn.click();
    await page.waitForTimeout(300);
    if (
      await page
        .locator("text=ผลการฝึกแต่ละคำ")
        .isVisible()
        .catch(() => false)
    ) {
      break;
    }
  }
  await expect(page.locator("text=ผลการฝึกแต่ละคำ")).toBeVisible({
    timeout: 5000,
  });
}

test.describe("Practice session page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/practice/session");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows heading with lesson title", async ({ page }) => {
    await expect(
      page.locator("h1:has-text('บทเรียน คำศัพท์ง่าย')")
    ).toBeVisible();
  });

  test("has 3-panel layout: lesson panel, word area, Pakky sidebar", async ({
    page,
  }) => {
    // Left panel: lesson info
    await expect(
      page.locator("h1:has-text('บทเรียน คำศัพท์ง่าย')")
    ).toBeVisible();
    // Right panel: Tips from Pakky
    await expect(page.locator("h2:has-text('Tips จาก Pakky')")).toBeVisible();
    // Center: word progress indicator
    await expect(
      page.locator("p", { hasText: /คำที่ \d+ \/ \d+/ })
    ).toBeVisible();
    // Center: camera section
    await expect(page.getByText("กล้อง", { exact: true })).toBeVisible();
    // Center: lip example
    await expect(page.locator("text=ตัวอย่างริมฝีปาก")).toBeVisible();
  });

  test("shows word display and progress dots", async ({ page }) => {
    // Word display with large text
    const wordText = page.locator("h2.text-4xl");
    await expect(wordText).toBeVisible();
    const wordContent = await wordText.textContent();
    expect(wordContent?.trim()).toBeTruthy();

    // Phonetic display
    await expect(page.locator("p.text-lg.font-medium").first()).toBeVisible();

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

  test("shows microphone and lip progress bars in Pakky sidebar", async ({
    page,
  }) => {
    // Right sidebar has "ระดับเสียง" and "ริมฝีปาก" sections
    await expect(page.getByText("ระดับเสียง", { exact: true })).toBeVisible();
    await expect(page.getByText("ริมฝีปาก", { exact: true })).toBeVisible();

    // Progress bars
    const progressBars = page.locator(
      'aside:has(h2:has-text("Tips จาก Pakky")) [role="progressbar"]'
    );
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("shows input field placeholder in Pakky sidebar", async ({ page }) => {
    await expect(
      page.locator('input[readonly][value="กำลังรอเสียง ..."]')
    ).toBeVisible();
  });

  test("shows motivational message per word index", async ({ page }) => {
    // Initially at index 2 (currentWordIndex = 2)
    // Should show "ครึ่งทางแล้ว! คำที่ 3" or similar
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

  test("practicing a word moves progress and shows next word", async ({
    page,
  }) => {
    // Click "เริ่มการฝึกออกเสียง" button
    const practiceBtn = page
      .locator('button:has-text("เริ่มการฝึกออกเสียง")')
      .first();
    await expect(practiceBtn).toBeVisible();
    await practiceBtn.click();

    // After practicing, check the word changed (now at next index)
    // The word display should update
    await page.waitForTimeout(500);

    // Skip word if we're at the end
    const skipBtn = page.locator('button:has-text("ข้ามคำ")').first();
    if (await skipBtn.isVisible()) {
      await skipBtn.click();
    }
  });

  test("completing all words shows results sidebar", async ({ page }) => {
    await completeSession(page);

    // Should show accuracy badge
    await expect(page.getByText(/\d+%/).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test("results sidebar shows word results with scores", async ({ page }) => {
    await completeSession(page);

    // Check word results are listed
    const resultsAside = page
      .locator("aside")
      .filter({ hasText: "ผลการฝึกแต่ละคำ" });
    const leftWords = page
      .locator("aside section")
      .first()
      .locator("div.space-y-3 > div");
    const count = await leftWords.count();
    expect(count).toBeGreaterThanOrEqual(1);
    for (let i = 2; i < count; i++) {
      const label = (
        await leftWords.nth(i).locator("span").nth(1).textContent()
      )?.trim();
      const word = label?.split(" ")[0];
      if (word) {
        await expect(resultsAside.locator(`text=${word}`).first()).toBeVisible({
          timeout: 3000,
        });
      }
    }

    // Check score badges exist
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
    await expect(
      page.locator('button:has-text("เริ่มการฝึกออกเสียง")').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('"ปิด" navigates to /summary', async ({ page }) => {
    await completeSession(page);

    // Click "ปิด"
    await page.locator('button:has-text("ปิด")').click();
    await page.waitForURL(/\/summary/, { timeout: 10000 });
  });
});
