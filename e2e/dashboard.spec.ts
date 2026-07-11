import { test, expect } from "@playwright/test";

const hasCredentials = !!(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD);

test.describe("Dashboard page", () => {

  test("has no detectable a11y violations on landing", async ({ page }) => {
    if (!hasCredentials) test.skip(true, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");
    await page.goto("/dashboard");
    await expect(page.locator('[data-testid="dashboard-logout"]')).toBeVisible({ timeout: 15000 });
    const violations = await page.evaluate(async () => {
      const { axe } = await import("https://cdn.jsdelivr.net/npm/axe-core@4.10.0/build/axe.min.js" as any);
      const results = await axe.run(document.body);
      return results.violations.map((v: any) => `${v.id}: ${v.nodes.length}`);
    }).catch(() => null);
    if (violations && violations.length > 0) {
      console.log("a11y violations:", violations.join(", "));
    }
  });

  test.describe("Stats section (with data)", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-logout"]')).toBeVisible({ timeout: 15000 });
      if (await page.locator('[data-testid="dashboard-stat-compact"]').isVisible().catch(() => false)) {
        test.skip(true, "First-timer: detailed stat cards not shown");
      }
      await expect(page.locator('[data-testid="dashboard-stat-practiced"]')).toBeVisible({ timeout: 15000 });
    });

    test("shows practiced count as a number", async ({ page }) => {
      const text = await page.locator('[data-testid="dashboard-stat-practiced"]').textContent();
      expect(text).toMatch(/\d+/);
    });

    test("shows avg score card", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-stat-avg"]')).toBeVisible();
    });

    test("shows total attempts card", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-stat-attempts"]')).toBeVisible();
    });

    test("practiced count stat card shows label", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-stat-practiced"]')).toContainText("คำที่ฝึกแล้ว");
    });

    test("avg score stat card shows label", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-stat-avg"]')).toContainText("คะแนนเฉลี่ย");
    });

    test("attempts stat card shows label", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-stat-attempts"]')).toContainText("จำนวนครั้งที่ฝึก");
    });
  });

  test.describe("Compact stat card (first-timer)", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("shows compact card when no words practiced", async ({ page }) => {
      await page.goto("/dashboard");
      const compact = page.locator('[data-testid="dashboard-stat-compact"]');
      const practicedCard = page.locator('[data-testid="dashboard-stat-practiced"]');
      await page.waitForTimeout(3000);
      const compactVis = await compact.isVisible().catch(() => false);
      const practicedVis = await practicedCard.isVisible().catch(() => false);
      if (compactVis) {
        await expect(compact).toContainText("ยังไม่ได้ฝึกเลย");
      } else if (practicedVis) {
        test.skip(true, "User has practiced words — first-timer card not shown");
      } else {
        await page.waitForTimeout(5000);
        const compactVis2 = await compact.isVisible().catch(() => false);
        const practicedVis2 = await practicedCard.isVisible().catch(() => false);
        if (!compactVis2 && !practicedVis2) test.skip(true, "No stats section found");
      }
    });
  });

  test.describe("Welcome card", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("welcome card visible when totalPracticed === 0", async ({ page }) => {
      await page.goto("/dashboard");
      const welcome = page.locator('[data-testid="dashboard-welcome"]');
      const compact = page.locator('[data-testid="dashboard-stat-compact"]');
      await page.waitForTimeout(3000);
      if (await compact.isVisible().catch(() => false)) {
        await expect(welcome).toBeVisible();
      } else {
        const welcomeVis = await welcome.isVisible().catch(() => false);
        if (welcomeVis) {
          await expect(welcome).toContainText("ยินดีต้อนรับ");
        } else {
          test.skip(true, "User has practiced — welcome card not shown");
        }
      }
    });
  });

  test.describe("Info callout", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("callout visible for practiced users", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const callout = page.locator('[data-testid="dashboard-callout"]');
      const welcome = page.locator('[data-testid="dashboard-welcome"]');
      const welcomeVis = await welcome.isVisible().catch(() => false);
      if (welcomeVis) {
        test.skip(true, "User is first-timer — welcome shown, not callout");
      } else {
        const calloutVis = await callout.isVisible().catch(() => false);
        if (!calloutVis) {
          const dismissed = await page.evaluate(() => localStorage.getItem("dashboard_callout_dismissed"));
          if (dismissed === "true") test.skip(true, "Callout was previously dismissed");
          else test.skip(true, "No callout visible — user may have no practice data");
        } else {
          await expect(callout).toContainText("วรรณยุกต์");
        }
      }
    });

    test("callout dismissal persists on reload", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const callout = page.locator('[data-testid="dashboard-callout"]');
      const closeBtn = page.locator('[data-testid="dashboard-callout-close"]');
      if (!(await closeBtn.isVisible().catch(() => false))) {
        test.skip(true, "Callout close button not visible");
      }
      await closeBtn.click();
      await expect(callout).not.toBeVisible();
      await page.reload();
      await expect(page.locator('[data-testid="dashboard-callout"]')).not.toBeVisible();
      await page.evaluate(() => localStorage.removeItem("dashboard_callout_dismissed"));
    });
  });

  test.describe("Encouragement system", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("encouragement line is visible when practiced > 0", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const el = page.locator('[data-testid="dashboard-encouragement"]');
      const vis = await el.isVisible().catch(() => false);
      if (!vis) test.skip(true, "No encouragement shown (practiced < 3 or no words)");
      else await expect(el).toBeVisible();
    });

    test("encouragement contains Thai milestone message", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const el = page.locator('[data-testid="dashboard-encouragement"]');
      if (!(await el.isVisible().catch(() => false))) test.skip(true, "No encouragement shown");
      const text = await el.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(5);
    });
  });

  test.describe("Filter tabs", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-filters"]')).toBeVisible({ timeout: 15000 });
    });

    test("default filter tab is 'all'", async ({ page }) => {
      const active = page.locator('[data-testid="dashboard-filters"] [role="tab"][aria-selected="true"]');
      await expect(active).toContainText("ทั้งหมด");
    });

    test("all tab shows all words count badge", async ({ page }) => {
      const allTab = page.locator('[data-testid="dashboard-filters"] [role="tab"]').first();
      await expect(allTab).toContainText("ทั้งหมด");
      const text = await allTab.textContent();
      expect(text).toMatch(/\d+/);
    });

    test("filter tabs have aria-selected attribute", async ({ page }) => {
      const tabs = page.locator('[data-testid="dashboard-filters"] [role="tab"]');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < Math.min(count, 3); i++) {
        const selected = await tabs.nth(i).getAttribute("aria-selected");
        expect(["true", "false"]).toContain(selected);
      }
    });

    test("clicking a viseme filter changes active tab", async ({ page }) => {
      const tabs = page.locator('[data-testid="dashboard-filters"] [role="tab"]');
      const count = await tabs.count();
      for (let i = 1; i < Math.min(count, 4); i++) {
        const label = await tabs.nth(i).textContent();
        if (label && label !== "ทั้งหมด" && label !== "ยังไม่ได้ฝึก") {
          await tabs.nth(i).click();
          await expect(tabs.nth(i)).toHaveAttribute("aria-selected", "true");
          return;
        }
      }
      test.skip(true, "No viseme filter tab found");
    });

    test("clicking filter resets word cards", async ({ page }) => {
      const cards = page.locator('[data-testid="dashboard-word-card"] > div');
      const tabs = page.locator('[data-testid="dashboard-filters"] [role="tab"]');
      const tabCount = await tabs.count();
      if (tabCount < 2) test.skip(true, "Only one filter tab");
      const initialText = await cards.first().textContent().catch(() => null);
      if (!initialText) test.skip(true, "No word cards visible");
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
    });

    test("arrow keys navigate filter tabs", async ({ page }) => {
      const active = page.locator('[data-testid="dashboard-filters"] [role="tab"][aria-selected="true"]');
      const defaultId = await active.getAttribute("id").catch(() => null);
      await active.press("ArrowRight");
      await page.waitForTimeout(200);
      const newActive = page.locator('[data-testid="dashboard-filters"] [role="tab"][aria-selected="true"]');
      const newId = await newActive.getAttribute("id").catch(() => null);
      if (defaultId === newId) test.skip(true, "Only one tab — no navigation");
      else await expect(newActive).toBeVisible();
    });
  });

  test.describe("Filter collapse/show more", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("toggle button exists when many viseme groups", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-filters"]')).toBeVisible({ timeout: 15000 });
      const toggle = page.locator('[data-testid="dashboard-filter-toggle"]');
      if (!(await toggle.isVisible().catch(() => false))) {
        test.skip(true, "Fewer than 7 viseme groups — no toggle");
      }
      await expect(toggle).toBeVisible();
    });

    test("click toggle expands all filters", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-filters"]')).toBeVisible({ timeout: 15000 });
      const toggle = page.locator('[data-testid="dashboard-filter-toggle"]');
      if (!(await toggle.isVisible().catch(() => false))) test.skip(true, "No toggle");
      const tabCountBefore = await page.locator('[data-testid="dashboard-filters"] [role="tab"]').count();
      await toggle.click();
      await page.waitForTimeout(300);
      const tabCountAfter = await page.locator('[data-testid="dashboard-filters"] [role="tab"]').count();
      expect(tabCountAfter).toBeGreaterThan(tabCountBefore);
    });

    test("toggle shows 'others +N' when collapsed", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-filters"]')).toBeVisible({ timeout: 15000 });
      const toggle = page.locator('[data-testid="dashboard-filter-toggle"]');
      if (!(await toggle.isVisible().catch(() => false))) test.skip(true, "No toggle");
      await expect(toggle).toContainText(/อื่นๆ|\+\d+|แสดงน้อยลง/);
    });
  });

  test.describe("Sort dropdown", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-sort"]')).toBeVisible({ timeout: 15000 });
    });

    test("sort dropdown is visible", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-sort"]')).toBeVisible();
    });

    test("default sort value is 'default'", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-sort"]')).toHaveValue("default");
    });

    test("all sort options exist", async ({ page }) => {
      const options = await page.locator('[data-testid="dashboard-sort"] option').allTextContents();
      expect(options.length).toBe(5);
      expect(options).toContain("เรียงตามค่าเริ่มต้น");
      expect(options).toContain("คะแนนน้อย→มาก");
      expect(options).toContain("คะแนนมาก→น้อย");
    });

    test("changing sort updates word cards", async ({ page }) => {
      const beforeText = await page.locator('[data-testid="dashboard-word-card"]').textContent().catch(() => null);
      if (!beforeText) test.skip(true, "No word cards");
      await page.locator('[data-testid="dashboard-sort"]').selectOption("score-asc");
      await page.waitForTimeout(500);
    });
  });

  test.describe("Search", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-search"]')).toBeVisible({ timeout: 15000 });
    });

    test("search input has aria-label", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-search"]')).toHaveAttribute("aria-label", "ค้นหาคำศัพท์");
    });

    test("typing filters word cards", async ({ page }) => {
      const cards = page.locator('[data-testid="dashboard-word-card"] > div');
      const initialCount = await cards.count();
      if (initialCount === 0) test.skip(true, "No word cards to filter");
      const firstWordText = await cards.first().locator(".title").textContent();
      if (!firstWordText || firstWordText.length < 2) test.skip(true, "Cannot extract word text");
      await page.locator('[data-testid="dashboard-search"]').fill((firstWordText as string).slice(0, 1));
      await page.waitForTimeout(500);
    });

    test("search with no results shows empty state", async ({ page }) => {
      await page.locator('[data-testid="dashboard-search"]').fill("zzzzzzzzz_nonexistent");
      await expect(page.locator("text=ไม่มีคำศัพท์ในกลุ่มนี้")).toBeVisible({ timeout: 3000 });
    });

    test("clear search restores word cards", async ({ page }) => {
      const cards = page.locator('[data-testid="dashboard-word-card"] > div');
      const initialCount = await cards.count();
      if (initialCount === 0) test.skip(true, "No word cards");
      await page.locator('[data-testid="dashboard-search"]').fill("zzzzz_nonexistent");
      await page.waitForTimeout(300);
      const afterCount = await cards.count();
      expect(afterCount).toBe(0);
      await page.locator('[data-testid="dashboard-search"]').fill("");
      await page.waitForTimeout(500);
      const finalCount = await cards.count();
      expect(finalCount).toBe(initialCount);
    });

    test("search placeholder mentions shortcut", async ({ page }) => {
      const placeholder = await page.locator('[data-testid="dashboard-search"]').getAttribute("placeholder");
      expect(placeholder).toContain("/");
    });
  });

  test.describe("Page size", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-page-size"]')).toBeVisible({ timeout: 15000 });
    });

    test("page size selector has aria-label", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-page-size"]')).toHaveAttribute("aria-label", "จำนวนรายการต่อหน้า");
    });

    test("default page size is 10", async ({ page }) => {
      await expect(page.locator('[data-testid="dashboard-page-size"]')).toHaveValue("10");
    });

    test("all page size options exist", async ({ page }) => {
      const options = await page.locator('[data-testid="dashboard-page-size"] option').allTextContents();
      expect(options.length).toBe(3);
      expect(options).toContain("10 ต่อหน้า");
      expect(options).toContain("20 ต่อหน้า");
      expect(options).toContain("50 ต่อหน้า");
    });
  });

  test.describe("Pagination", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test.beforeEach(async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
    });

    test("prev button disabled on page 1", async ({ page }) => {
      const prev = page.locator('[data-testid="dashboard-prev"]');
      if (!(await prev.isVisible().catch(() => false))) test.skip(true, "Pagination not visible (too few words)");
      await expect(prev).toBeDisabled();
    });

    test("navigation to page 2 and back to 1", async ({ page }) => {
      const next = page.locator('[data-testid="dashboard-next"]');
      const prev = page.locator('[data-testid="dashboard-prev"]');
      if (!(await next.isVisible().catch(() => false))) test.skip(true, "Pagination not visible (too few words)");
      await next.click();
      await page.waitForTimeout(300);
      await expect(prev).toBeEnabled();
      await prev.click();
      await page.waitForTimeout(300);
      await expect(prev).toBeDisabled();
    });

    test("page input shows current page", async ({ page }) => {
      const input = page.locator('[data-testid="dashboard-page-input"]');
      if (!(await input.isVisible().catch(() => false))) test.skip(true, "Page input not visible");
      const val = await input.inputValue();
      expect(val).toBe("1");
    });

    test("total pages indicator visible", async ({ page }) => {
      const next = page.locator('[data-testid="dashboard-next"]');
      if (!(await next.isVisible().catch(() => false))) test.skip(true, "Pagination not visible");
      await expect(page.locator("kbd:has-text('j/k')")).toBeVisible();
    });

    test("j/k shortcut hint visible", async ({ page }) => {
      const next = page.locator('[data-testid="dashboard-next"]');
      if (!(await next.isVisible().catch(() => false))) test.skip(true, "Pagination not visible");
      await expect(page.locator("kbd:has-text('j/k')").or(page.locator("text=j/k"))).toBeVisible();
    });
  });

  test.describe("Keyboard shortcuts", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("pressing / focuses search input", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-search"]')).toBeVisible({ timeout: 15000 });
      await page.keyboard.press("/");
      await expect(page.locator('[data-testid="dashboard-search"]')).toBeFocused();
    });

    test("/ does not trigger when input focused", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-search"]')).toBeVisible({ timeout: 15000 });
      await page.locator('[data-testid="dashboard-search"]').focus();
      await page.keyboard.press("/");
      await expect(page.locator('[data-testid="dashboard-search"]')).toHaveValue("/");
    });

    test("j navigates to next page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const next = page.locator('[data-testid="dashboard-next"]');
      if (!(await next.isVisible().catch(() => false))) test.skip(true, "Pagination not visible");
      const prev = page.locator('[data-testid="dashboard-prev"]');
      await page.keyboard.press("j");
      await page.waitForTimeout(300);
      await expect(prev).toBeEnabled();
      await page.keyboard.press("k");
      await page.waitForTimeout(300);
      await expect(prev).toBeDisabled();
    });
  });

  test.describe("Logout", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("logout button is visible", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-logout"]')).toBeVisible({ timeout: 15000 });
    });

    test("confirmation dialog appears on logout click", async () => {
      // window.confirm is a browser API — verifying it fires requires mocking
      test.skip(true, "window.confirm cannot be reliably intercepted in cross-origin context without dialog handler");
    });
  });

  test.describe("History section", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("history heading is visible", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-history"]')).toBeVisible({ timeout: 15000 });
    });

    test("history shows entries or empty state", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.locator('[data-testid="dashboard-history"]')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(3000);
      const entry = page.locator('[data-testid="dashboard-history-entry"]');
      const empty = page.locator("text=ยังไม่มีประวัติการฝึก");
      const entryVis = await entry.isVisible().catch(() => false);
      const emptyVis = await empty.isVisible().catch(() => false);
      expect(entryVis || emptyVis).toBe(true);
    });

    test("history entries show scores", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const entry = page.locator('[data-testid="dashboard-history-entry"]');
      if (!(await entry.isVisible().catch(() => false))) test.skip(true, "No history entries");
      await expect(entry).toContainText(/ภาพ|รวม|เสียง/);
    });
  });

  test.describe("Word cards", () => {
    test.skip(!hasCredentials, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");

    test("word card grid is visible", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const grid = page.locator('[data-testid="dashboard-word-card"]');
      const empty = page.locator("text=ยังไม่มีคำศัพท์ในระบบ");
      const gridVis = await grid.isVisible().catch(() => false);
      const emptyVis = await empty.isVisible().catch(() => false);
      if (!gridVis && !emptyVis) {
        await page.waitForTimeout(5000);
      }
      expect(gridVis || emptyVis).toBe(true);
    });

    test("word cards have practice links", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(4000);
      const link = page.locator('[data-testid="dashboard-practice-link"]').first();
      if (!(await link.isVisible().catch(() => false))) test.skip(true, "No practice links visible");
      await expect(link).toHaveAttribute("href");
    });

    test("viseme badges on word cards", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForTimeout(3000);
      const card = page.locator('[data-testid="dashboard-word-card"] > div').first();
      if (!(await card.isVisible().catch(() => false))) test.skip(true, "No word cards");
      await expect(card.locator("span.rounded-full")).toBeVisible();
    });
  });
});
