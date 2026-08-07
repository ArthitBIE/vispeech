import { test, expect, type Page } from "@playwright/test";

/**
 * PracticeWord acquires a mic stream in handleStartListening and passes it to
 * startAudioLevel, which wires it into an AudioContext but keeps no reference
 * to the stream itself. stopAudioLevel closes the context, and the unmount
 * cleanup stops the recognizer and the camera, but nothing ever calls
 * stream.getTracks().forEach(t => t.stop()) for the mic.
 *
 * Consequence: once a word has been practiced the microphone stays live for
 * the rest of the session and after navigating away, with the browser's
 * recording indicator lit. Asserted against real MediaStreamTracks rather
 * than UI state, because the UI correctly shows "not listening" either way.
 *
 * Note the camera stream *is* released correctly, so these assertions filter
 * on kind === "audio" to isolate the defect.
 */
async function instrumentTracks(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __tracks: MediaStreamTrack[] };
    w.__tracks = [];
    const md = navigator.mediaDevices;
    if (!md?.getUserMedia) return;
    const orig = md.getUserMedia.bind(md);
    md.getUserMedia = async function (constraints?: MediaStreamConstraints) {
      const stream = await orig(constraints);
      stream.getTracks().forEach(function (t) {
        w.__tracks.push(t);
      });
      return stream;
    };
  });
}

function liveMicCount(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __tracks: MediaStreamTrack[] };
    return (w.__tracks || []).filter(
      (t) => t.kind === "audio" && t.readyState === "live"
    ).length;
  });
}

/**
 * Start practice and wait for the mic to open. Listening is not button-driven:
 * an effect starts it once the word audio has finished playing. The <audio>
 * element is mounted dynamically, so poll for it instead of assuming it is
 * present at click time.
 */
async function beginPracticeAndWaitForMic(page: Page): Promise<boolean> {
  const start = page.getByRole("button", { name: "เริ่มการฝึกออกเสียง" });
  await expect(start.first()).toBeVisible({ timeout: 20000 });
  await start.first().click();

  for (let i = 0; i < 40; i++) {
    if ((await liveMicCount(page)) > 0) return true;
    // Nudge any audio element that has appeared to its end state so the
    // listening effect fires without waiting out the whole clip.
    await page
      .evaluate(() => {
        document.querySelectorAll("audio").forEach(function (a) {
          a.muted = true;
          void a.play().catch(function () {});
          a.dispatchEvent(new Event("ended"));
        });
      })
      .catch(() => {});
    await page.waitForTimeout(250);
  }
  return false;
}

test.describe("Practice microphone lifecycle", () => {
  test("microphone is released when leaving the practice page", async ({
    page,
  }) => {
    await page.context().grantPermissions(["microphone", "camera"]);
    await instrumentTracks(page);

    await page.goto("/practice/session");
    const opened = await beginPracticeAndWaitForMic(page);
    expect(opened, "microphone never opened, cannot test release").toBe(true);

    // Client-side navigation, so the page context (and the track list) lives on.
    await page.getByRole("button", { name: "ยกเลิกการฝึก" }).first().click();
    await expect(page).not.toHaveURL(/practice/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    expect(
      await liveMicCount(page),
      "microphone still live after leaving the practice page"
    ).toBe(0);
  });

  test("microphone is released after the attempt is submitted", async ({
    page,
  }) => {
    await page.context().grantPermissions(["microphone", "camera"]);
    await instrumentTracks(page);

    await page.goto("/practice/session");
    const opened = await beginPracticeAndWaitForMic(page);
    expect(opened, "microphone never opened, cannot test release").toBe(true);

    const submit = page.getByRole("button", { name: "ส่งผล" });
    await expect(submit.first()).toBeVisible({ timeout: 15000 });
    await submit.first().click();
    await page.waitForTimeout(2500);

    expect(
      await liveMicCount(page),
      "microphone still live after the attempt was submitted"
    ).toBe(0);
  });
});
