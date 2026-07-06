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

  recognition.onerror = (event: any) => {
    errorCallbacks.forEach((cb) => cb(event.error || "Unknown error"));
  };

  return {
    start: async () => {
      recognition.start();
    },
    stop: async () => {
      recognition.stop();
      return finalTranscript;
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

function createFallbackRecognizer(): SpeechRecognizer {
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
