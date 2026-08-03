import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSpeechRecognizer } from "../index";

class MockSpeechRecognition {
  static instances: MockSpeechRecognition[] = [];
  lang = "";
  continuous = false;
  interimResults = false;
  start = vi.fn();
  stop = vi.fn();
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    MockSpeechRecognition.instances.push(this);
  }
}

describe("createSpeechRecognizer (real Web Speech API path)", () => {
  beforeEach(() => {
    MockSpeechRecognition.instances = [];
    vi.stubGlobal("window", { SpeechRecognition: MockSpeechRecognition });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isAvailable() returns true when Web Speech API exists", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    expect(recognizer.isAvailable()).toBe(true);
  });

  it("start() called twice only starts the recognizer once", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    await recognizer.start();
    await recognizer.start();
    const instance = MockSpeechRecognition.instances[0];
    expect(instance.start).toHaveBeenCalledTimes(1);
  });

  it("restarts the recognizer on onend while running", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    await recognizer.start();
    const instance = MockSpeechRecognition.instances[0];
    expect(instance.start).toHaveBeenCalledTimes(1);

    instance.onend?.();
    expect(instance.start).toHaveBeenCalledTimes(2);
  });

  it("does not restart on onend after the user stops", async () => {
    const recognizer = createSpeechRecognizer("th-TH");
    await recognizer.start();
    const instance = MockSpeechRecognition.instances[0];

    await recognizer.stop();
    instance.onend?.();
    expect(instance.start).toHaveBeenCalledTimes(1);
  });

  it("emits the full final transcript and correct isFinal", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    const callback = vi.fn();
    recognizer.onResult(callback);
    const instance = MockSpeechRecognition.instances[0];

    instance.onresult?.({
      resultIndex: 0,
      results: [
        {
          0: { transcript: "สวัสดี", confidence: 0.9 },
          isFinal: true,
          length: 1,
        },
        {
          0: { transcript: "ครับ", confidence: 0.8 },
          isFinal: true,
          length: 1,
        },
      ],
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      transcript: "สวัสดีครับ",
      confidence: 0.8,
      isFinal: true,
    });
  });

  it("emits interim transcript with isFinal false while interim is present", () => {
    const recognizer = createSpeechRecognizer("th-TH");
    const callback = vi.fn();
    recognizer.onResult(callback);
    const instance = MockSpeechRecognition.instances[0];

    instance.onresult?.({
      resultIndex: 0,
      results: [
        {
          0: { transcript: "สวัส", confidence: 0.5 },
          isFinal: false,
          length: 1,
        },
      ],
    });

    expect(callback).toHaveBeenCalledWith({
      transcript: "สวัส",
      confidence: 0.5,
      isFinal: false,
    });
  });
});
