import { test, expect } from "@playwright/test";

/**
 * startTest() awaits getUserMedia before storing the stream in streamRef.
 * If the component unmounts (user navigates away) while that permission /
 * acquisition step is still pending, the cleanup runs first and the stream
 * lands in the ref afterwards, with nothing left to stop it.
 *
 * Consequence: the microphone stays live after leaving the page, with the
 * browser's recording indicator still lit. This is a privacy bug, not a
 * cosmetic one, so it is asserted against real tracks in a real browser.
 */
test.describe("Settings mic test lifecycle", () => {
  test("microphone is released when navigating away mid-acquisition", async ({
    page,
  }) => {
    await page.context().grantPermissions(["microphone"]);

    // Track every MediaStreamTrack getUserMedia ever hands out, and delay
    // resolution so we can navigate away while the call is still pending.
    await page.addInitScript(() => {
      const w = window as unknown as {
        __tracks: MediaStreamTrack[];
        __gumDelay: number;
      };
      w.__tracks = [];
      const orig = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );
      navigator.mediaDevices.getUserMedia = async (
        c?: MediaStreamConstraints
      ) => {
        const stream = await orig(c);
        await new Promise((r) => setTimeout(r, w.__gumDelay ?? 0));
        stream.getTracks().forEach((t) => w.__tracks.push(t));
        return stream;
      };
    });

    await page.goto("/settings");

    const startBtn = page.getByRole("button", { name: "Start Test" });
    await expect(startBtn).toBeVisible({ timeout: 15000 });

    // Make the *next* getUserMedia slow, then click and immediately leave.
    await page.evaluate(() => {
      (window as unknown as { __gumDelay: number }).__gumDelay = 3000;
    });

    await startBtn.click();
    await page.waitForTimeout(200); // click registered, gUM still pending

    // Navigate away while acquisition is in flight (client-side nav so the
    // page context, and therefore the track list, survives).
    await page
      .getByRole("link", { name: /หน้าหลัก|Dashboard/ })
      .first()
      .click();
    await expect(page).not.toHaveURL(/settings/, { timeout: 10000 });

    // Let the pending getUserMedia resolve.
    await page.waitForTimeout(4000);

    const live = await page.evaluate(() => {
      const w = window as unknown as { __tracks: MediaStreamTrack[] };
      return (w.__tracks || []).filter((t) => t.readyState === "live").length;
    });

    expect(live, "microphone track still live after leaving settings").toBe(0);
  });

  test("microphone is released when the test is stopped mid-acquisition", async ({
    page,
  }) => {
    await page.context().grantPermissions(["microphone"]);

    await page.addInitScript(() => {
      const w = window as unknown as {
        __tracks: MediaStreamTrack[];
        __gumDelay: number;
      };
      w.__tracks = [];
      const orig = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices
      );
      navigator.mediaDevices.getUserMedia = async (
        c?: MediaStreamConstraints
      ) => {
        const stream = await orig(c);
        await new Promise((r) => setTimeout(r, w.__gumDelay ?? 0));
        stream.getTracks().forEach((t) => w.__tracks.push(t));
        return stream;
      };
    });

    await page.goto("/settings");

    const btn = page.getByRole("button", { name: "Start Test" });
    await expect(btn).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => {
      (window as unknown as { __gumDelay: number }).__gumDelay = 2500;
    });

    await btn.click();
    await page.waitForTimeout(200);

    // The button only flips to "Stop Test" after the await resolves, so
    // during acquisition the user can only click the same control again.
    await page.getByRole("button", { name: /Start Test|Stop Test/ }).click();

    await page.waitForTimeout(3500);

    const live = await page.evaluate(() => {
      const w = window as unknown as { __tracks: MediaStreamTrack[] };
      return (w.__tracks || []).filter((t) => t.readyState === "live").length;
    });

    // Either the test is running (user re-armed it) or fully stopped, but a
    // track must never be live while the UI shows it stopped.
    const showsStopped = await page
      .getByRole("button", { name: "Start Test" })
      .isVisible();
    if (showsStopped) {
      expect(live, "microphone live while UI shows the test stopped").toBe(0);
    }
  });
});
