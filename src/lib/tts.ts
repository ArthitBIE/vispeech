export interface SpeakOptions {
  onProgress?: (fraction: number) => void; // 0..1 during playback
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let current: { id: symbol; start: number; started: boolean } | null = null;

// Chrome loads voices asynchronously. Resolve immediately if available,
// otherwise wait for `voiceschanged` (once) and a 1s timeout fallback so we
// never hang (Linux Chrome returns []).
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesPromise) return voicesPromise;
  const synth = window.speechSynthesis;
  voicesPromise = new Promise((resolve) => {
    const list = synth.getVoices();
    if (list.length > 0) {
      resolve(list);
      return;
    }
    let settled = false;
    const done = (result: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      synth.removeEventListener("voiceschanged", onChange);
      resolve(result);
    };
    const onChange = () => done(synth.getVoices());
    synth.addEventListener("voiceschanged", onChange);
    const fallback = setTimeout(() => done(synth.getVoices()), 1000);
  });
  return voicesPromise;
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  current = null;
}

export async function speakThai(
  text: string,
  opts: SpeakOptions = {}
): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onError?.(new Error("Web Speech API unsupported"));
    return;
  }
  const synth = window.speechSynthesis;
  const voices = await getVoices();
  const thai =
    voices.find((v) => v.lang === "th-TH") ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("th"));
  if (!thai) {
    opts.onError?.(new Error("No Thai voice installed"));
    return;
  }
  if (synth.speaking || synth.pending) {
    synth.cancel();
    // Chrome drops a speak() issued on the same stack as cancel().
    await new Promise((r) => setTimeout(r, 120));
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = thai;
  u.lang = "th-TH";
  u.rate = 0.8;

  const id = Symbol("utterance");
  const total = text.length || 1;
  const start = Date.now();
  current = { id, start, started: false };

  let done = false;
  let interval: ReturnType<typeof setInterval> | undefined;
  const finish = (progress: number, err?: Error) => {
    if (done) return;
    done = true;
    if (interval) clearInterval(interval);
    if (current?.id === id) current = null;
    opts.onProgress?.(progress);
    if (err) opts.onError?.(err);
    else opts.onEnd?.();
  };

  u.onstart = () => {
    if (current?.id !== id) return;
    opts.onProgress?.(0);
  };
  u.onboundary = (e) => {
    if (current?.id !== id) return;
    opts.onProgress?.(Math.min(1, e.charIndex / total));
  };
  u.onend = () => {
    if (current?.id !== id) return;
    finish(1);
  };
  u.onerror = () => {
    if (current?.id !== id) return;
    finish(0, new Error("Speech synthesis error"));
  };

  synth.speak(u);

  // Google/OS voices rarely fire boundary events, so drive progress off a
  // timer. Force-finalize at the estimated duration even if the browser drops
  // onend or leaves `speaking` stuck true (Linux Chrome) — otherwise the
  // word's progress never resets. No pause/resume hack: it causes that stuck
  // state. `finish` is idempotent, so a late real onend is a no-op.
  interval = setInterval(() => {
    if (current?.id !== id) {
      clearInterval(interval);
      return;
    }
    current.started = true;
    const elapsed = Date.now() - start;
    const estimated = total * 90 + 1000; // ~90ms per char + 1s base
    if (elapsed >= estimated) {
      finish(1);
      return;
    }
    opts.onProgress?.(Math.min(0.97, elapsed / estimated));
  }, 100);
}
