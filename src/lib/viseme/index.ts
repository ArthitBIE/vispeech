export interface SpeechResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface SpeechRecognizer {
  start: () => Promise<void>
  stop: () => Promise<string>
  isAvailable: () => boolean
  onResult: (callback: (result: SpeechResult) => void) => void
  onError: (callback: (error: string) => void) => void
}

export function createSpeechRecognizer(lang = "th-TH"): SpeechRecognizer {
  const SpeechRecognition =
    (typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null;

  if (!SpeechRecognition) {
    console.warn("Web Speech API not available, using demo mode");
    return createFallbackRecognizer();
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;

  const resultCallbacks: ((result: SpeechResult) => void)[] = [];
  const errorCallbacks: ((error: string) => void)[] = [];
  let finalTranscript = "";
  let fallbackRecognizer: ReturnType<typeof createFallbackRecognizer> | null = null;
  let inFallback = false;

  const switchToFallback = () => {
    if (inFallback) return;
    inFallback = true;
    try { recognition.stop(); } catch {}
    fallbackRecognizer = createFallbackRecognizer();
    resultCallbacks.forEach((cb) => fallbackRecognizer!.onResult(cb));
    errorCallbacks.forEach((cb) => fallbackRecognizer!.onError(cb));
    fallbackRecognizer!.start();
  };

  recognition.onresult = (event: any) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interim += transcript;
      }
    }

    const current = interim || finalTranscript.split(" ").slice(-1)[0] || "";
    resultCallbacks.forEach((cb) =>
      cb({
        transcript: current,
        confidence: event.results[event.results.length - 1][0].confidence,
        isFinal: !!interim,
      }),
    );
  };

  const errorMessages: Record<string, string> = {
    network: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เสียง กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
    "not-allowed": "ไม่อนุญาตให้ใช้ไมโครโฟน กรุณาอนุญาตการเข้าใช้งานไมโครโฟน",
    "no-speech": "ไม่พบเสียงพูด กรุณาลองอีกครั้ง",
    aborted: "การฟังถูกขัดจังหวะ กรุณาลองใหม่",
    "audio-capture": "ไม่พบไมโครโฟน กรุณาตรวจสอบไมโครโฟนของคุณ",
    "language-not-supported": "เบราว์เซอร์นี้ไม่รองรับภาษาไทยสำหรับการรู้จำเสียงพูด",
    "service-not-allowed": "ไม่สามารถใช้บริการรู้จำเสียงพูดในขณะนี้ กรุณาลองใหม่ภายหลัง",
  };

  const recoverableErrors = ["network", "service-not-allowed", "language-not-supported", "audio-capture", "not-allowed"];

  recognition.onerror = (event: any) => {
    const code = event.error || "unknown";
    const msg = errorMessages[code] || "เกิดข้อผิดพลาดในการรู้จำเสียงพูด กรุณาลองใหม่";

    if (recoverableErrors.includes(code)) {
      console.warn(`Speech recognition ${code} error, falling back to demo mode`);
      switchToFallback();
      return;
    }

    errorCallbacks.forEach((cb) => cb(msg));
  };

  return {
    start: async () => {
      if (inFallback && fallbackRecognizer) {
        return fallbackRecognizer.start();
      }
      recognition.start();
    },
    stop: async () => {
      if (inFallback && fallbackRecognizer) {
        return fallbackRecognizer.stop();
      }
      recognition.stop();
      return finalTranscript;
    },
    isAvailable: () => !inFallback,
    onResult: (cb) => {
      resultCallbacks.push(cb);
      if (inFallback && fallbackRecognizer) {
        fallbackRecognizer.onResult(cb);
      }
    },
    onError: (cb) => {
      errorCallbacks.push(cb);
      if (inFallback && fallbackRecognizer) {
        fallbackRecognizer.onError(cb);
      }
    },
  };
}

export function createFallbackRecognizer(): SpeechRecognizer {
  const resultCallbacks: ((result: SpeechResult) => void)[] = [];
  const errorCallbacks: ((error: string) => void)[] = [];
  let running = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    start: async () => {
      running = true;
      await new Promise((r) => setTimeout(r, 300));
    },
    stop: async () => {
      running = false;
      if (timeoutId) clearTimeout(timeoutId);
      await new Promise((r) => setTimeout(r, 1500));
      return "demo-transcript";
    },
    isAvailable: () => false,
    onResult: (cb) => {
      resultCallbacks.push(cb);
    },
    onError: (cb) => {
      errorCallbacks.push(cb);
      timeoutId = setTimeout(
        () => cb("เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด"),
        100,
      );
    },
  };
}