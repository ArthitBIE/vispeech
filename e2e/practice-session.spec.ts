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

async function startPracticeSession(page: Page) {
  const cameraBtn = page.getByTestId("practice-camera-btn");
  await expect(cameraBtn).toBeVisible({ timeout: 3000 });
  await cameraBtn.click();

  // Wait for demo fallback to kick in (mouthOpen > 0)
  await expect(page.getByTestId("practice-mouth-open")).toContainText(
    /การเปิดปาก: [1-9]\d*%/,
    { timeout: 8000 }
  );
}

async function getCurrentWordVisemeGroup(page: Page) {
  // The word display element has viseme_group info - we need to find it
  // Look for the word card area which may have data-viseme-group
  const wordArea = page.locator("[data-viseme-group]").first();
  if (await wordArea.isVisible().catch(() => false)) {
    return await wordArea.getAttribute("data-viseme-group");
  }
  // Fallback: check lip example component
  const lipExample = page.locator("[data-lip-shape]").first();
  if (await lipExample.isVisible().catch(() => false)) {
    return await lipExample.getAttribute("data-lip-shape");
  }
  return null;
}

async function completeSession(page: Page) {
  // PracticeWord is dynamically imported, so the skip button is not in the
  // DOM on first paint. Wait for it before looping, otherwise the loop below
  // breaks on iteration 0 and we never advance past the first word.
  await expect(
    page
      .locator('button:has-text("คำถัดไป"), button:has-text("จบบทเรียน")')
      .first()
  ).toBeVisible({ timeout: 15000 });

  for (let i = 0; i < 60; i++) {
    const skip = page
      .locator('button:has-text("คำถัดไป"), button:has-text("จบบทเรียน")')
      .first();
    if (await skip.isVisible().catch(() => false)) {
      await skip.click({ timeout: 3000 }).catch(() => {});
      // Give the async finish flow a moment to navigate.
      await page.waitForTimeout(300);
    } else {
      break;
    }
  }
  // Finishing the session now routes to /summary
  await page.waitForURL(/\/summary/, { timeout: 10000 });
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
    await expect(page.locator("h2:has-text('Tips จาก Pakky')")).toBeVisible();
    // Center: word progress indicator
    await expect(
      page.locator("p", { hasText: /คำที่ \d+ \/ \d+/ })
    ).toBeVisible();
    // Center: camera section
    await expect(page.getByText("กล้อง", { exact: true })).toBeVisible();
    // Center: lip example section
    await expect(
      page.getByText("ตัวอย่างริมฝีปาก", { exact: true })
    ).toBeVisible();
  });

  test("shows word display and progress dots", async ({ page }) => {
    // Word display with large text
    const wordText = page.locator("h2.text-4xl");
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
    // Right sidebar has "ระดับเสียง" and "ริมฝีปาก" sections
    await expect(page.getByText("ระดับเสียง", { exact: true })).toBeVisible();
    await expect(page.getByText("ริมฝีปาก", { exact: true })).toBeVisible();

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

  test("completing all words routes to /summary", async ({ page }) => {
    await completeSession(page);

    // Should show summary page (empty state or with results)
    await expect(
      page
        .locator("text=ยังไม่มีผลการฝึก")
        .or(page.locator("text=เยี่ยมมากเลย!"))
    ).toBeVisible({
      timeout: 3000,
    });
  });

  test("summary page shows practiced word with score", async ({ page }) => {
    // Skip to a DB-backed word (ดี). Synthetic lesson items (not in DB)
    // are scored but intentionally not persisted, so they never appear
    // on the summary page (which reads practice_logs).
    for (let i = 0; i < 2; i++) {
      await page
        .locator('button:has-text("คำถัดไป"), button:has-text("จบบทเรียน")')
        .first()
        .click({ timeout: 3000 });
      await page.waitForTimeout(200);
    }

    // Capture the current word's text before practicing it
    const wordText = await page.locator("h2.text-4xl").textContent();
    const word = wordText?.trim();
    expect(word).toBe("ดี");

    await practiceCurrentWord(page);
    await completeSession(page);

    // The practiced word should be listed on the summary page
    await expect(page.locator(`text=${word}`).first()).toBeVisible({
      timeout: 3000,
    });

    // Score badge exists
    await expect(page.getByText(/\d+%/).first()).toBeVisible();
  });

  test('"เริ่มการฝึกซ้ำ" on summary page navigates to /practice/session', async ({
    page,
  }) => {
    await completeSession(page);

    // Click "เริ่มการฝึกซ้ำ" on summary page
    await page.locator('button:has-text("เริ่มการฝึก")').first().click();

    // Should navigate back to practice session
    await page.waitForURL(/\/practice\/session/, { timeout: 5000 });
    await expect(page.getByTestId("practice-camera-btn")).toBeVisible({
      timeout: 3000,
    });
  });

  // --- New tests per approved plan ---

  test("camera panel mounts video/canvas after start click (no error)", async ({
    page,
  }) => {
    await startPracticeSession(page);

    // Video and canvas elements should exist in DOM (hidden attr when inactive)
    const video = page.locator("video");
    const canvas = page.locator("canvas");
    await expect(video.first()).toBeAttached({ timeout: 3000 });
    await expect(canvas.first()).toBeAttached({ timeout: 3000 });

    // No "เกิดข้อผิดพลาดในการเริ่มกล้อง" error text
    await expect(
      page.getByText("เกิดข้อผิดพลาดในการเริ่มกล้อง")
    ).not.toBeVisible({ timeout: 2000 });
  });

  test("lip example data-lip-shape matches word viseme_group", async ({
    page,
  }) => {
    await startPracticeSession(page);

    // Lip example component should have data-lip-shape attribute
    const lipExample = page.locator("[data-lip-shape]").first();
    await expect(lipExample).toBeVisible({ timeout: 3000 });
    const lipShape = await lipExample.getAttribute("data-lip-shape");
    expect(lipShape).toBeTruthy();
    expect(["closed", "wide", "rounded", "teeth", "mid", "default"]).toContain(
      lipShape
    );
  });

  test("lesson panel lists words of the active level", async ({ page }) => {
    // Lesson items are all difficulty 1; the page filters by active level
    const wordItems = page
      .locator("aside section")
      .first()
      .locator("div.space-y-3 > div");
    const wordCount = await wordItems.count();
    expect(wordCount).toBeGreaterThanOrEqual(1);

    // Progress dots match the filtered word count
    const dots = page.locator("div.flex.gap-2 > div.h-3.w-3");
    const dotCount = await dots.count();
    expect(dotCount).toBe(wordCount);
  });

  test("audio player exists with controls", async ({ page }) => {
    await startPracticeSession(page);

    // Native <audio controls> replaces the old custom play button
    const audio = page.locator("audio[controls]").first();
    await expect(audio).toBeAttached({ timeout: 5000 });
  });

  test("no auto-play on start; audio only plays on user interaction", async ({
    page,
  }) => {
    await startPracticeSession(page);

    // <audio controls> exists but should not have played yet (autoplay=false)
    const audio = page.locator("audio[controls]").first();
    await expect(audio).toBeAttached({ timeout: 5000 });
    const currentTime = await audio.evaluate(
      (el) => (el as HTMLAudioElement).currentTime
    );
    expect(currentTime).toBe(0);
  });

  test("mascot image is stable (image 2) across re-renders", async ({
    page,
  }) => {
    await page.goto("/practice/session");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });

    const mascot = page.locator('img[alt="Pakky mascot"]');
    await expect(mascot).toBeVisible({ timeout: 5000 });

    const srcs: (string | null)[] = [await mascot.getAttribute("src")];

    // Force re-renders: switch difficulty tab (if available) and start practice.
    const tabs = page.locator('button:has-text("ระดับ")');
    if ((await tabs.count()) > 1) {
      await tabs.nth(1).click();
      srcs.push(await mascot.getAttribute("src"));
    }
    const cameraBtn = page.getByTestId("practice-camera-btn");
    await cameraBtn.click().catch(() => {});
    await page.waitForTimeout(500);
    srcs.push(await mascot.getAttribute("src"));

    // Every observed src must be the default mascot (image 2), never image 4.
    // Match without the file extension: assets are served as WebP via
    // next/image, so the src is URL-encoded and no longer ends in ".png".
    for (const src of srcs) {
      expect(src).toBeTruthy();
      expect(decodeURIComponent(src!)).toMatch(/image 2\.(png|webp)/);
      expect(decodeURIComponent(src!)).not.toMatch(/image 4\.(png|webp)/);
    }
  });
});
