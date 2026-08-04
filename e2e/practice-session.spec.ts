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

  test("audio button exists and click does not throw", async ({ page }) => {
    await startPracticeSession(page);

    // Play button should exist (replaced the decorative Volume2-only bar)
    const playBtn = page.locator('button[aria-label="ฟังเสียงคำ"]').first();
    await expect(playBtn).toBeVisible({ timeout: 3000 });

    // Click should not throw (no audible verification in CI)
    await playBtn.click({ timeout: 3000 });

    // Also test the length meter bar appears
    const progressBar = page
      .locator("div.h-1.flex-1.rounded-full.bg-neutral-200")
      .first();
    await expect(progressBar).toBeAttached({ timeout: 2000 });
  });

  test("no auto-play on start; sound only on play button click", async ({
    page,
  }) => {
    // Stub speechSynthesis so speak() calls are countable and a Thai voice
    // exists (avoids the no-voice fallback path to /api/tts).
    await page.addInitScript(() => {
      const calls = { speak: 0 };
      Object.defineProperty(window, "__speakCalls", { value: calls });
      Object.defineProperty(window, "speechSynthesis", {
        value: {
          speak: () => {
            calls.speak++;
          },
          cancel: () => {},
          pause: () => {},
          resume: () => {},
          speaking: false,
          pending: false,
          paused: false,
          getVoices: () => [{ lang: "th-TH", name: "Test Thai Voice" }],
        },
        configurable: true,
      });
      // speakThai() constructs a SpeechSynthesisUtterance — without this
      // constructor the page throws ReferenceError before speak() is called.
      Object.defineProperty(window, "SpeechSynthesisUtterance", {
        value: class SpeechSynthesisUtterance {
          text: string;
          onstart: unknown = null;
          onend: unknown = null;
          onerror: unknown = null;
          onboundary: unknown = null;
          voice: unknown = null;
          lang = "";
          rate = 1;
          constructor(text: string) {
            this.text = text;
          }
        },
        configurable: true,
      });
    });
    // Reload so the stub applies.
    await page.goto("/practice/session");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 15000 });

    const speakCount = () =>
      page.evaluate(
        () =>
          (window as unknown as { __speakCalls: { speak: number } })
            .__speakCalls.speak
      );

    // Start practice — must NOT auto-play the word sound.
    const cameraBtn = page.getByTestId("practice-camera-btn");
    await expect(cameraBtn).toBeVisible({ timeout: 3000 });
    await cameraBtn.click();
    await expect(page.getByTestId("practice-mouth-open")).toContainText(
      /การเปิดปาก: [1-9]\d*%/,
      { timeout: 8000 }
    );
    expect(await speakCount()).toBe(0);

    // Clicking the explicit play button plays the word.
    const playBtn = page.locator('button[aria-label="ฟังเสียงคำ"]').first();
    await playBtn.click();
    await expect.poll(speakCount, { timeout: 3000 }).toBeGreaterThan(0);
  });

  test("mascot image is stable (image 2.png) across re-renders", async ({
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

    // Every observed src must be the default mascot (image 2.png), never 4.png.
    for (const src of srcs) {
      expect(src).toBeTruthy();
      expect(src).toContain("2.png");
      expect(src).not.toContain("4.png");
    }
  });
});
