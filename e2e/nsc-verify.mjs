import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "fs";

const BASE = "http://localhost:3000";
const OUT = "screenshots/nsc";
const AUTH = "e2e/.auth/user.json";
const LABELS_OK = [];
const LABELS_MISSING = [];

mkdirSync(OUT, { recursive: true });

function verify(label, found) {
  if (found) {
    LABELS_OK.push(label);
    console.log(`  ✓ ${label}`);
  } else {
    LABELS_MISSING.push(label);
    console.log(`  ✗ ${label} — NOT FOUND`);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--no-sandbox",
    ],
  });
  const context = await browser.newContext({
    storageState: AUTH,
    viewport: { width: 1440, height: 900 },
    baseURL: BASE,
    permissions: ["camera"],
  });
  const page = await context.newPage();


  // Catch-all for Supabase REST (specific mocks registered after take priority)
  await page.route("**/rest/v1/**", async (route) => {
    await route.abort("connectionrefused");
  });

  // Mock Supabase auth validation (instance is paused)
  await page.route("**/supabase.co/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "7d302330-9928-4fe2-8f49-ec7199a6004d",
        aud: "authenticated",
        role: "authenticated",
        email: "test-uat-1783439474@vispeech.com",
        confirmed_at: "2026-07-07T15:51:15.237771Z",
        last_sign_in_at: "2026-07-08T04:52:36.184051939Z",
        app_metadata: { provider: "email" },
        user_metadata: { email_verified: true },
      }),
    });
  });
  await page.route("**/supabase.co/auth/v1/token*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  // All other Supabase requests abort
  await page.route("**/supabase.co/**", (route) => route.abort("connectionrefused"));
  await page.route("**/api/words", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        words: [
          { id: "1", text: "สวัสดี", visemeGroup: "รูปปากกว้าง", difficulty: 1 },
          { id: "2", text: "ขอบคุณ", visemeGroup: "รูปปากกว้าง", difficulty: 2 },
          { id: "3", text: "รัก", visemeGroup: "รูปปากหุบ", difficulty: 1 },
          { id: "4", text: "ฟ้า", visemeGroup: "รูปปากกว้าง", difficulty: 2 },
          { id: "5", text: "ฝน", visemeGroup: "รูปปากหุบ", difficulty: 3 },
        ],
      }),
    });
  });
  await page.route("**/api/score", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        visual_score: 78,
        audio_score: 85,
        total_score: 82,
        feedback_th: "ดีมาก! การออกเสียงของคุณชัดเจน",
      }),
    });
  });
  // Mock word_accuracy and practice_logs queries
  await page.route("**/rest/v1/word_accuracy*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { word_id: "1", best_score: 92, average_score: 78.5, total_attempts: 5, last_practiced_at: "2026-07-08T10:00:00Z" },
        { word_id: "2", best_score: 88, average_score: 72.3, total_attempts: 3, last_practiced_at: "2026-07-07T14:30:00Z" },
        { word_id: "3", best_score: 95, average_score: 85.0, total_attempts: 4, last_practiced_at: "2026-07-06T09:15:00Z" },
      ]),
    });
  });
  await page.route("**/rest/v1/practice_logs*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "l1", word_id: "1", visual_score: 80, audio_score: 90, total_score: 86, created_at: "2026-07-08T10:00:00Z", words: { word: "สวัสดี" } },
        { id: "l2", word_id: "2", visual_score: 75, audio_score: 82, total_score: 79, created_at: "2026-07-07T14:30:00Z", words: { word: "ขอบคุณ" } },
        { id: "l3", word_id: "3", visual_score: 90, audio_score: 95, total_score: 93, created_at: "2026-07-06T09:15:00Z", words: { word: "รัก" } },
      ]),
    });
  });

  // ----------------------------------------------------------------
  // 1. Dashboard
  // ----------------------------------------------------------------
  console.log("\n=== DASHBOARD ===");
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="dashboard-word-card"]', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/01-dashboard.png`, fullPage: true });

  verify(
    'Stat card text "คำที่ฝึกแล้ว"',
    await page.locator("text=คำที่ฝึกแล้ว").first().isVisible(),
  );
  verify(
    'Stat card text "คะแนนเฉลี่ย"',
    await page.locator("section.grid >> text=คะแนนเฉลี่ย").isVisible(),
  );
  verify(
    'Stat card text "จำนวนครั้งที่ฝึก"',
    await page.locator("text=จำนวนครั้งที่ฝึก").first().isVisible(),
  );
  verify(
    'Table header "คำ"',
    await page.locator("thead >> text=คำ").first().isVisible(),
  );
  verify(
    'Table header "กลุ่มรูปปาก"',
    await page.locator("thead >> text=กลุ่มรูปปาก").isVisible(),
  );
  verify(
    'Table header "คะแนนดีที่สุด"',
    await page.locator("thead >> text=คะแนนดีที่สุด").isVisible(),
  );
  verify(
    'data-testid="dashboard-word-card" present',
    (await page.locator('[data-testid="dashboard-word-card"]').count()) > 0,
  );

  // ----------------------------------------------------------------
  // 2. Session — Ready phase
  // ----------------------------------------------------------------
  console.log("\n=== SESSION — READY ===");
  const readyBtn = page.locator('button:has-text("เริ่มฝึก")').first();
  await readyBtn.click();
  await page.waitForURL("**/practice/session", { timeout: 10000 });
  await page.waitForSelector("text=เตรียมตัวออกเสียงคำนี้", { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/02-session-ready.png`, fullPage: true });

  verify('Text "เตรียมตัวออกเสียงคำนี้"', await page.locator("text=เตรียมตัวออกเสียงคำนี้").first().isVisible());
  verify("Viseme badge (indigo-50)", await page.locator(".rounded-full.bg-indigo-50").isVisible());

  // ----------------------------------------------------------------
  // 3. Session — Practicing phase
  // ----------------------------------------------------------------
  console.log("\n=== SESSION — PRACTICING ===");
  await page.click('button:has-text("เริ่มฝึกคำนี้")');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/03-session-practicing.png`, fullPage: true });

  verify('Camera section "กล้อง"', await page.locator("h2:has-text('กล้อง')").isVisible());
  verify('Speech section "เสียงพูด"', await page.locator("h2:has-text('เสียงพูด')").isVisible());
  verify('Button "เริ่มพูด"', await page.locator('button:has-text("เริ่มพูด")').first().isVisible());
  verify('Button "ส่งผล"', await page.locator('button:has-text("ส่งผล")').first().isVisible());

  // ----------------------------------------------------------------
  // 4. Session — Listening phase
  // ----------------------------------------------------------------
  console.log("\n=== SESSION — LISTENING ===");
  await page.click('button:has-text("เริ่มพูด")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/04-session-listening.png`, fullPage: true });

  verify('Listening "กำลังฟัง..."', await page.locator("text=กำลังฟัง...").isVisible());
  verify('Button "หยุดฟัง"', await page.locator('button:has-text("หยุดฟัง")').isVisible());

  // ----------------------------------------------------------------
  // 5-6. Scored & Summary — SKIPPED (requires real face/media)
  // ----------------------------------------------------------------
  console.log("\n=== SCORED & SUMMARY (SKIPPED) ===");
  console.log("  ⚠ Cannot reach scored/summary phases without real face detection.");
  console.log("  MediaPipe requires a real camera with a face visible.");
  console.log("  Manual verification required for scored and summary phases.");
  console.log("  (Environment limitation — headless Playwright)");

  // ----------------------------------------------------------------
  // 5. Responsive — Dashboard at 1280×800
  // ----------------------------------------------------------------
  console.log("\n=== RESPONSIVE (1280×800) ===");
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="dashboard-word-card"]', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/05-dashboard-1280.png`, fullPage: true });
  console.log("  1280×800 screenshot captured.");

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  await browser.close();

  console.log("\n========================");
  console.log("RESULTS");
  console.log(`  Passed: ${LABELS_OK.length}`);
  console.log(`  Missing: ${LABELS_MISSING.length}`);
  if (LABELS_MISSING.length > 0) {
    console.log("\n  Missing:");
    LABELS_MISSING.forEach((l) => console.log(`    - ${l}`));
  }
  console.log("\nScreenshots:", OUT);
  console.log("========================\n");
  process.exit(LABELS_MISSING.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
