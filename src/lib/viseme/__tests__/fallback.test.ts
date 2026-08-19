import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSpeechRecognizer } from "../index";

// In the test environment, window.SpeechRecognition is typically undefined,
// so createSpeechRecognizer returns the dead recognizer. Tests verify it
// surfaces errors instead of producing fake transcripts.

describe("createSpeechRecognizer", () => {
  it("returns a SpeechRecognizer object", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    expect(recognizer).toBeDefined();
    expect(typeof recognizer.start).toBe("function");
    expect(typeof recognizer.stop).toBe("function");
    expect(typeof recognizer.isAvailable).toBe("function");
    expect(typeof recognizer.onResult).toBe("function");
    expect(typeof recognizer.onError).toBe("function");
  });

  it("isAvailable returns false when no Web Speech API", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    expect(recognizer.isAvailable()).toBe(false);
  });

  it("stop returns empty string when no Web Speech API", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    const result = await recognizer.stop();
    expect(result).toBe("");
  });

  it("onError fires with Thai error message when no Web Speech API", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    const callback = vi.fn();
    recognizer.onError(callback);
    await recognizer.start();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.stringContaining("เบราว์เซอร์")
    );
  });

  it("onResult never fires when no Web Speech API", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    const callback = vi.fn();
    recognizer.onResult(callback);
    await recognizer.start();
    expect(callback).not.toHaveBeenCalled();
  });
});
