import { test, expect } from "@playwright/test";

test.describe("Summary page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/summary");
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
  });

  test("shows congratulations hero section", async ({ page }) => {
    await expect(
      page.locator("h1:has-text('เยี่ยมมากเลย')"),
    ).toBeVisible();
    await expect(
      page.locator("text=ฝึกครบทุกคำแล้ววันนี้เก่งมาก!"),
    ).toBeVisible();
  });

  test("shows lesson name", async ({ page }) => {
    await expect(
      page.locator("text=Lesson คำศัพท์ง่าย"),
    ).toBeVisible();
  });

  test("shows star rating (5 stars)", async ({ page }) => {
    const stars = page.locator("div.flex.items-center.gap-1 svg");
    const starCount = await stars.count();
    expect(starCount).toBe(5);
  });

  test("shows word results section heading", async ({ page }) => {
    await expect(
      page.locator("h2:has-text('ผลการฝึกแต่ละคำ')"),
    ).toBeVisible();
  });

  test("shows all 5 word results", async ({ page }) => {
    const words = ["ยา", "ฝา", "ดี", "มี", "ดู"];
    for (const word of words) {
      await expect(page.locator(`text=${word}`).first()).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("word results show score percentages", async ({ page }) => {
    const scores = ["100%", "72%", "88%", "65%", "98%"];
    for (const score of scores) {
      await expect(page.locator(`text=${score}`).first()).toBeVisible({
        timeout: 3000,
      });
    }
  });

  test("expanded word shows lip feedback, sound feedback, and recommendation", async ({
    page,
  }) => {
    // "ฝา" has expanded: true, so it already shows feedback sections
    await expect(
      page.locator("text=ปากกว้างไม่พอ").first(),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.locator("text=ถูกต้อง").first(),
    ).toBeVisible({ timeout: 3000 });
    await expect(
      page.locator("text=ลองอ้าปากกว้างขึ้นให้เห็นฟันบนเล็กน้อย").first(),
    ).toBeVisible({ timeout: 3000 });
  });

  test('shows "เริ่มการฝึกซ้ำ" and "กลับหน้าหลัก" buttons', async ({
    page,
  }) => {
    await expect(
      page.locator('button:has-text("เริ่มการฝึกซ้ำ")'),
    ).toBeVisible();

    await expect(
      page.locator('button:has-text("กลับหน้าหลัก")'),
    ).toBeVisible();
  });
});
