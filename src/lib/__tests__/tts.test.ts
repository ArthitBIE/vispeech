import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SpeakOptions } from "../tts";

// Helper to fire a typed boundary event
function boundary(charIndex: number) {
  return { charIndex } as SpeechSynthesisEvent;
}

describe("speakThai", () => {
  let mockSpeechSynthesis: SpeechSynthesis;
  let speakThai: (text: string, opts?: SpeakOptions) => Promise<void>;
  let stopSpeaking: () => void;
  let createdUtterance: SpeechSynthesisUtterance | null = null;

  beforeEach(async () => {
    vi.resetModules();
    createdUtterance = null;

    mockSpeechSynthesis = {
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        createdUtterance = utterance;
      }),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => [
        {
          lang: "th-TH",
          name: "Kanya",
          voiceURI: "x",
          default: true,
          localService: true,
        },
      ]),
      pending: false,
      speaking: false,
      paused: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as SpeechSynthesis;

    // Mock SpeechSynthesisUtterance as a proper constructor that returns trackable instance
    const MockUtterance = vi.fn(function (
      this: SpeechSynthesisUtterance,
      text: string
    ) {
      this.lang = "";
      this.rate = 1;
      this.text = text;
      this.voice = null;
      this.volume = 1;
      this.pitch = 1;
      this.onstart = null;
      this.onend = null;
      this.onerror = null;
      this.onpause = null;
      this.onresume = null;
      this.onmark = null;
      this.onboundary = null;
    }) as unknown as { new (text: string): SpeechSynthesisUtterance };

    vi.stubGlobal("SpeechSynthesisUtterance", MockUtterance);

    Object.defineProperty(global, "window", {
      value: { speechSynthesis: mockSpeechSynthesis },
      writable: true,
      configurable: true,
    });

    // Dynamic import after mocks are set up
    const mod = await import("../../lib/tts");
    speakThai = mod.speakThai;
    stopSpeaking = mod.stopSpeaking;
  });

  afterEach(() => {
    // Stop the progress timer if an utterance is still active
    createdUtterance?.onend?.(null as unknown as SpeechSynthesisEvent);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("calls onError when window is undefined (SSR)", async () => {
    const originalWindow = global.window;
    // @ts-expect-error - delete for test
    delete global.window;

    const onError = vi.fn();
    await speakThai("test", { onError });
    expect(onError).toHaveBeenCalled();

    global.window = originalWindow;
  });

  it("calls onError when speechSynthesis is not available", async () => {
    const originalWindow = global.window;
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
      configurable: true,
    });

    const onError = vi.fn();
    await speakThai("test", { onError });
    expect(onError).toHaveBeenCalled();

    global.window = originalWindow;
  });

  it("calls onError when no Thai voice is installed", async () => {
    (mockSpeechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(
      []
    );
    const onError = vi.fn();
    await speakThai("สวัสดี", { onError });
    expect(onError).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
  });

  it("cancels existing speech before speaking new text", async () => {
    (mockSpeechSynthesis as { speaking: boolean }).speaking = true;
    await speakThai("สวัสดี");

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(createdUtterance).not.toBeNull();
  });

  it("speaks without cancelling when nothing is playing", async () => {
    await speakThai("สวัสดี");

    expect(mockSpeechSynthesis.cancel).not.toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it("picks the th-TH voice and sets it on the utterance", async () => {
    await speakThai("สวัสดี");

    expect(createdUtterance?.voice).toMatchObject({ lang: "th-TH" });
  });

  it("sets utterance lang to th-TH", async () => {
    await speakThai("สวัสดี");

    expect(createdUtterance?.lang).toBe("th-TH");
  });

  it("sets utterance rate to 0.8", async () => {
    await speakThai("สวัสดี");

    expect(createdUtterance?.rate).toBe(0.8);
  });

  it("sets utterance text to the input text", async () => {
    await speakThai("สวัสดีครับ");

    expect(createdUtterance?.text).toBe("สวัสดีครับ");
  });

  it("handles empty string without error", async () => {
    await speakThai("");

    expect(createdUtterance?.text).toBe("");
  });

  it("calls onProgress with 0 on start", async () => {
    const onProgress = vi.fn();
    await speakThai("สวัสดี", { onProgress });

    createdUtterance?.onstart?.({} as SpeechSynthesisEvent);

    expect(onProgress).toHaveBeenCalledWith(0);
  });

  it("calls onProgress with ~0.5 on boundary at half the text", async () => {
    const onProgress = vi.fn();
    const text = "สวัสดีครับ";
    await speakThai(text, { onProgress });

    createdUtterance?.onboundary?.(boundary(Math.floor(text.length / 2)));

    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it("calls onProgress with 1 and onEnd on end", async () => {
    const onProgress = vi.fn();
    const onEnd = vi.fn();
    await speakThai("สวัสดี", { onProgress, onEnd });

    createdUtterance?.onend?.(null as unknown as SpeechSynthesisEvent);

    expect(onProgress).toHaveBeenCalledWith(1);
    expect(onEnd).toHaveBeenCalled();
  });

  it("clamps boundary progress to 1", async () => {
    const onProgress = vi.fn();
    const text = "สวัสดี";
    await speakThai(text, { onProgress });

    createdUtterance?.onboundary?.(boundary(text.length + 10));

    expect(onProgress).toHaveBeenCalledWith(1);
  });

  it("calls onError on utterance error", async () => {
    const onProgress = vi.fn();
    const onError = vi.fn();
    await speakThai("สวัสดี", { onProgress, onError });

    createdUtterance?.onerror?.(null as unknown as SpeechSynthesisErrorEvent);

    expect(onProgress).toHaveBeenCalledWith(0);
    expect(onError).toHaveBeenCalled();
  });

  it("handles empty text boundary without dividing by zero", async () => {
    const onProgress = vi.fn();
    await speakThai("", { onProgress });

    createdUtterance?.onboundary?.(boundary(0));

    expect(onProgress).toHaveBeenCalledWith(0);
  });

  it("stopSpeaking cancels the synthesis", () => {
    stopSpeaking();

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it("force-finalizes with onProgress(1) + onEnd at estimated duration even if onend never fires", async () => {
    vi.useFakeTimers();
    const onProgress = vi.fn();
    const onEnd = vi.fn();
    await speakThai("สวัสดี", { onProgress, onEnd });

    // estimated = 6 chars * 90 + 1000 = 1540ms; onend is never fired here
    vi.advanceTimersByTime(1600);

    expect(onProgress).toHaveBeenLastCalledWith(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
