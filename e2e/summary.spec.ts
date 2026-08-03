import { test, expect, type Page } from "@playwright/test";

const SESSION = {
  id: "s1",
  total_attempts: 2,
  passed_count: 1,
  best_score: 88,
  created_at: "2026-07-01T10:00:00.000Z",
};

const RESULTS = [
  {
    word: "ยิ้ม",
    phonetic: "/yim/",
    viseme_group: "ริมฝีปากปิด",
    visual_score: 85,
    audio_score: 90,
    total_score: 88,
    attempt_number: 1,
    created_at: "2026-07-01T10:00:01.000Z",
  },
  {
    word: "สวัสดี",
    phonetic: "/sa-wat-dii/",
    viseme_group: "ทักทาย",
    visual_score: 60,
    audio_score: 65,
    total_score: 62,
    attempt_number: 2,
    created_at: "2026-07-01T10:00:02.000Z",
  },
];

async function mockPracticeSessions(page: Page, body: unknown) {
  await page.route("**/api/practice-sessions", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    })
  );
}

test.describe("Summary page", () => {
  test.beforeEach(async ({ page }) => {
    await mockPracticeSessions(page, { session: SESSION, results: RESULTS });
    await page.goto("/summary");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows congratulations hero section", async ({ page }) => {
    await expect(page.locator("h1:has-text('เยี่ยมมากเลย')")).toBeVisible();
    await expect(
      page.locator("text=ฝึกครบทุกคำแล้ววันนี้เก่งมาก!")
    ).toBeVisible();
  });

  test("shows average accuracy", async ({ page }) => {
    // avg of [88, 62] = 75
    await expect(page.locator("text=ความแม่นยำเฉลี่ย 75.0%")).toBeVisible();
  });

  test("shows star rating (4 stars)", async ({ page }) => {
    // Count filled stars (yellow) vs empty (muted)
    const filledStars = page.locator(
      "div.flex.items-center.gap-1 svg.fill-yellow-400"
    );
    const starCount = await filledStars.count();
    expect(starCount).toBe(4);
  });

  test("shows word results section heading", async ({ page }) => {
    await expect(page.locator("h2:has-text('ผลการฝึกแต่ละคำ')")).toBeVisible();
  });

  test("shows word results from the session", async ({ page }) => {
    for (const word of ["ยิ้ม", "สวัสดี"]) {
      await expect(page.locator(`text=${word}`).first()).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("word results show score percentages", async ({ page }) => {
    for (const score of ["88%", "62%"]) {
      await expect(page.locator(`text=${score}`).first()).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("failing word is expanded with feedback", async ({ page }) => {
    // "สวัสดี" (62) is below the pass threshold and auto-expanded
    await expect(page.locator("text=ปากกว้างไม่พอ").first()).toBeVisible({
      timeout: 3000,
    });
    await expect(
      page.locator("text=ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย").first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("clicking a passing word expands its feedback", async ({ page }) => {
    await page.locator("text=ยิ้ม").first().click();
    await expect(page.locator("text=ถูกต้อง").first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('shows "เริ่มการฝึกซ้ำ" and "กลับหน้าหลัก" buttons', async ({
    page,
  }) => {
    await expect(
      page.locator('button:has-text("เริ่มการฝึกซ้ำ")')
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "กลับหน้าหลัก" })
    ).toBeVisible();
  });
});

test.describe("Summary page - empty state", () => {
  test.beforeEach(async ({ page }) => {
    await mockPracticeSessions(page, { session: null, results: [] });
    await page.goto("/summary");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows empty state with CTA", async ({ page }) => {
    await expect(page.locator("text=ยังไม่มีผลการฝึก")).toBeVisible();
    await expect(
      page.locator("text=เริ่มฝึกคำศัพท์เพื่อดูผลลัพธ์และความคืบหน้าของคุณ")
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("เริ่มการฝึก")').first()
    ).toBeVisible();
  });
});
