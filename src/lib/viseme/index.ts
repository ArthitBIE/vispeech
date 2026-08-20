export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognizer {
  start: () => Promise<void>;
  stop: () => Promise<string>;
  clear: () => void;
  isAvailable: () => boolean;
  onResult: (callback: (result: SpeechResult) => void) => void;
  onError: (callback: (error: string) => void) => void;
}

function createDeadRecognizer(): SpeechRecognizer {
  // Returned when Web Speech API is unavailable. Never produces results;
  // errors fire immediately so the UI can display them.
  const errorCallbacks: ((error: string) => void)[] = [];
  let fired = false;
  return {
    start: async () => {
      if (!fired) {
        fired = true;
        errorCallbacks.forEach((cb) =>
          cb("เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด")
        );
      }
    },
    stop: async () => "",
    clear: () => {},
    isAvailable: () => false,
    onResult: () => {},
    onError: (cb) => {
      errorCallbacks.push(cb);
      // Fire immediately if start() already ran
      if (!fired) {
        fired = true;
        cb("เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียงพูด");
      }
    },
  };
}

export function createSpeechRecognizer(lang = "th-TH"): SpeechRecognizer {
  const SpeechRecognition =
    (typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null;

  if (!SpeechRecognition) {
    return createDeadRecognizer();
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;

  const resultCallbacks: ((result: SpeechResult) => void)[] = [];
  const errorCallbacks: ((error: string) => void)[] = [];
  let finalTranscript = "";
  let running = false;
  let stopping = false;

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

    const current = (interim || finalTranscript).trim();
    resultCallbacks.forEach((cb) =>
      cb({
        transcript: current,
        confidence: event.results[event.results.length - 1][0].confidence,
        isFinal: !interim,
      })
    );
  };

  const errorMessages: Record<string, string> = {
    network:
      "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เสียง กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
    "not-allowed": "ไม่อนุญาตให้ใช้ไมโครโฟน กรุณาอนุญาตการเข้าใช้งานไมโครโฟน",
    "no-speech": "ไม่พบเสียงพูด กรุณาลองอีกครั้ง",
    aborted: "การฟังถูกขัดจังหวะ กรุณาลองใหม่",
    "audio-capture": "ไม่พบไมโครโฟน กรุณาตรวจสอบไมโครโฟนของคุณ",
    "language-not-supported":
      "เบราว์เซอร์นี้ไม่รองรับภาษาไทยสำหรับการรู้จำเสียงพูด",
    "service-not-allowed":
      "ไม่สามารถใช้บริการรู้จำเสียงพูดในขณะนี้ กรุณาลองใหม่ภายหลัง",
  };

  recognition.onerror = (event: any) => {
    const code = event.error || "unknown";
    const msg =
      errorMessages[code] || "เกิดข้อผิดพลาดในการรู้จำเสียงพูด กรุณาลองใหม่";
    errorCallbacks.forEach((cb) => cb(msg));
  };

  // Chrome fires onend after silence/network hiccups even with continuous=true.
  // Restart automatically unless the user stopped.
  recognition.onend = () => {
    if (!running || stopping) return;
    try {
      recognition.start();
    } catch {}
  };

  return {
    start: async () => {
      if (running) return;
      finalTranscript = "";
      running = true;
      stopping = false;
      try {
        recognition.start();
      } catch (err) {
        running = false;
        errorCallbacks.forEach((cb) =>
          cb("เกิดข้อผิดพลาดในการรู้จำเสียงพูด กรุณาลองใหม่")
        );
      }
    },
    stop: async () => {
      stopping = true;
      running = false;
      recognition.stop();
      return finalTranscript;
    },
    clear: () => {
      finalTranscript = "";
      try {
        // abort() flushes the pending result queue; older TS lib.dom omits it.
        (recognition as unknown as { abort?: () => void }).abort?.();
      } catch {}
    },
    isAvailable: () => true,
    onResult: (cb) => {
      resultCallbacks.push(cb);
    },
    onError: (cb) => {
      errorCallbacks.push(cb);
    },
  };
}
