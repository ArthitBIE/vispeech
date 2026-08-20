"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LipExample } from "@/components/practice/LipExample";
import {
  Camera,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Smile,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface WordRow {
  id: string;
  word: string;
  viseme_group: string;
  difficulty: number;
  phonetic?: string;
}

export interface ScoreResult {
  visual_score: number;
  audio_score: number;
  total_score: number;
  feedback_th: string;
}

export interface LiveState {
  mouthOpen: number;
  audioLevel: number;
  transcript: string;
}

export interface PracticeWordProps {
  word: WordRow;
  onScored: (result: ScoreResult) => void;
  onSkip: () => void;
  onLive?: (live: LiveState) => void;
  sessionId?: string | null;
  isLast?: boolean;
}

export function PracticeWord({
  word,
  onScored,
  onSkip,
  onLive,
  sessionId,
  isLast = false,
}: PracticeWordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouthSamplesRef = useRef<number[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listeningStartedRef = useRef(false);
  const audioLevelRef = useRef(0);
  const maxMouthOpenRef = useRef(0);
  const transcriptRef = useRef("");
  // The live capture stream, held so it can be stopped. The AudioContext and
  // analyser are not enough: closing them leaves the device open.
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  // Latest handleStopCamera, so the unmount cleanup stops the current
  // face-mesh instance (state would be stale inside the [] effect).
  const stopCameraRef = useRef<() => void>(() => {});

  const [cameraActive, setCameraActive] = useState(false);
  const [faceMesh, setFaceMesh] = useState<FaceMeshInstance | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const [recognizer, setRecognizer] = useState<SpeechRecognizer | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0.8); // default for fallback/demo
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [practicing, setPracticing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [avgMouthOpen, setAvgMouthOpen] = useState(0);
  const [, setError] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const [audioPlayed, setAudioPlayed] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
      audioRef.current?.pause();
      // Read through the ref at cleanup time on purpose. This effect mounts
      // before the TTS fetch resolves, so audioRef.current is still null then;
      // copying it into a local up top (what exhaustive-deps suggests) would
      // capture null and silently skip the revoke, leaking the blob URL.
      if (audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);
      recognizerRef.current?.stop();
      stopCameraRef.current();
      // Release the mic explicitly: unmount can happen mid-attempt, with no
      // stopAudioLevel on the way out.
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    };
  }, []);

  // Keep refs in sync for the onResult rAF callback (avoids stale closures).
  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  // onLive is called inside the onResult rAF to avoid render cascades.

  // Fetch TTS audio when word changes
  useEffect(() => {
    // No state reset here on purpose. SessionContent mounts this component
    // with key={word.id}, so a new word is a fresh instance and every piece
    // of audio state is already at its initial value. Resetting in the effect
    // body was a no-op that cost a second render pass on every mount.
    listeningStartedRef.current = false;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: word.word }),
        });
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (!cancelled) setAudioSrc(URL.createObjectURL(blob));
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [word.id, word.word]);

  // Start STT after audio finishes playing during practice.
  // Declared below handleStartListening so the effect closes over the current
  // render's copy rather than reaching backwards to a hoisted binding.

  async function handleStartCamera() {
    if (!videoRef.current || !canvasRef.current) {
      setError("เกิดข้อผิดพลาดในการเริ่มกล้อง กรุณาลองใหม่");
      return;
    }

    faceMesh?.stop();

    const instance = await initFaceMesh(videoRef.current, canvasRef.current);
    let rafPending = false;
    instance.onResult((res) => {
      // Throttle state updates to one per animation frame — prevents
      // "Maximum update depth exceeded" from ~30fps camera callbacks.
      if (res.mouthOpen > 0) {
        mouthSamplesRef.current.push(res.mouthOpen);
        if (res.mouthOpen > maxMouthOpenRef.current)
          maxMouthOpenRef.current = res.mouthOpen;
      }
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          setMouthOpen(res.mouthOpen);
          onLive?.({
            mouthOpen: res.mouthOpen,
            audioLevel: audioLevelRef.current,
            transcript: transcriptRef.current,
          });
          rafPending = false;
        });
      }
    });
    try {
      await instance.start();
      setFaceMesh(instance);
      setCameraActive(true);
    } catch {
      instance.stop();
    }
  }

  function handleStopCamera() {
    faceMesh?.stop();
    setCameraActive(false);
    setFaceMesh(null);
  }
  // Keep the unmount cleanup pointed at the latest closure. Assigning during
  // render would make the ref disagree with the committed tree if React
  // rendered without committing.
  useEffect(() => {
    stopCameraRef.current = handleStopCamera;
  });

  function startAudioLevel(stream: MediaStream) {
    // Keep the stream itself, not just the analyser graph. Closing the
    // AudioContext does not release the capture device; only stopping the
    // tracks turns the microphone (and its recording indicator) off.
    micStreamRef.current = stream;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setAudioLevel(Math.min(100, Math.round(rms * 400)));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopAudioLevel() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setAudioLevel(0);
  }

  async function handleStartListening() {
    if (speechError) setSpeechError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startAudioLevel(stream);
    } catch {
      // No mic access — continue without live level
    }

    const sr = createSpeechRecognizer("th-TH");
    sr.onResult((res) => {
      setTranscript(res.transcript);
      setConfidence(res.confidence ?? 0.8);
    });
    sr.onError((msg) => {
      setSpeechError(msg);
      setListening(false);
    });

    sr.start();
    setRecognizer(sr);
    recognizerRef.current = sr;
    setListening(true);
  }

  // Start STT immediately when practice starts — don't gate on audio playback
  // because auto-play can fail (browser policy, audio not yet loaded, etc.).
  // listeningStartedRef guards against re-entry: `listening` only flips true
  // after handleStartListening awaits getUserMedia, so this effect can re-run
  // before the flag it checks has been set.
  useEffect(() => {
    if (practicing && !listening && !listeningStartedRef.current) {
      listeningStartedRef.current = true;
      handleStartListening();
    }
    // handleStartListening is redeclared every render and is intentionally
    // omitted; the ref guard, not the dep array, controls when it fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicing, audioPlayed, listening]);

  async function handleStopListening() {
    if (!recognizer) return;
    const final = await recognizer.stop();
    setTranscript((prev) => prev || final);
    setListening(false);
    stopAudioLevel();
  }

  function handleStartPractice() {
    mouthSamplesRef.current = [];
    maxMouthOpenRef.current = 0;
    handleStartCamera();
    setPracticing(true);
    setAudioPlayed(false);
    listeningStartedRef.current = false;
    // Auto-play TTS so mic activates after audio ends (via useEffect)
    audioRef.current?.play().catch(() => {});
  }

  async function handleSubmit() {
    setSubmitting(true);

    // The attempt is over: release the mic before scoring rather than leaving
    // it open across the network round-trip and the whole results screen.
    if (listening) await handleStopListening();
    else stopAudioLevel();

    const samples = mouthSamplesRef.current;
    const avgMouth =
      samples.length > 0
        ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
        : mouthOpen;
    setAvgMouthOpen(avgMouth);

    try {
      const {
        data: { session },
      } = await supabase!.auth.getSession();
      if (!session) {
        // Let parent handle auth redirect
        setError("กรุณาเข้าสู่ระบบก่อนฝึก");
        return;
      }

      const payload = {
        wordId: word.id,
        transcript,
        mouthOpen: avgMouth,
        sessionId,
        targetText: word.word,
        visemeGroup: word.viseme_group,
        confidence,
      };

      const res = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Score API failed");
      const score: ScoreResult = await res.json();
      setResult(score);
      onScored(score);
    } catch {
      setError("เกิดข้อผิดพลาดในการบันทึกผล กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  function handleTryAgain() {
    // Stop recognizer first to prevent onResult firing after clear
    recognizerRef.current?.stop();
    handleStopCamera();
    stopAudioLevel();
    setResult(null);
    setAvgMouthOpen(0);
    setTranscript("");
    setMouthOpen(0);
    mouthSamplesRef.current = [];
    maxMouthOpenRef.current = 0;
    setListening(false);
    setPracticing(false);
    setAudioPlayed(false);
    listeningStartedRef.current = false;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  function handleRestart() {
    // Stop recognizer first to prevent onResult firing after clear
    recognizerRef.current?.stop();
    handleStopCamera();
    stopAudioLevel();
    setTranscript("");
    setMouthOpen(0);
    mouthSamplesRef.current = [];
    maxMouthOpenRef.current = 0;
    setListening(false);
    setAudioPlayed(false);
    listeningStartedRef.current = false;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  }

  const readyToSubmit = Boolean(transcript) && maxMouthOpenRef.current > 0;

  return (
    <div>
      {/* Word card */}
      <Card className="mx-auto max-w-2xl rounded-xl border border-neutral-300 shadow-none">
        <CardContent className="p-6 text-center">
          <h2 className="text-4xl font-bold leading-none text-neutral-900">
            {word.word}
          </h2>
          <p className="mt-2 text-lg font-medium text-neutral-700">
            {word.phonetic ?? "/.../"}
          </p>
          <p className="mt-1 text-base font-medium text-neutral-500">
            Good / {word.word}
          </p>

          {audioSrc && (
            <>
              <audio
                ref={audioRef}
                src={audioSrc}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setAudioPlayed(true);
                }}
              />
              <div className="mx-auto mt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isPlaying) audioRef.current?.pause();
                    else audioRef.current?.play().catch(() => {});
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white" />
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  aria-label="Restart audio"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {volume > 0 ? (
                    <Volume2 className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-neutral-500" />
                  )}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-20 w-5 [writing-mode:vertical-lr] [appearance:slider-vertical] accent-neutral-900"
                    aria-label="Volume"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {/* Camera panel */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Camera className="h-4 w-4" />
            <span>กล้อง</span>
          </div>

          <div className="relative h-56 w-full overflow-hidden rounded-sm bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              hidden={!cameraActive}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full"
              hidden={!cameraActive}
            />
            {!cameraActive && (
              <div className="flex h-full items-center justify-center text-sm text-white">
                ยังไม่ได้เปิดกล้อง
              </div>
            )}
          </div>

          <p
            className="mt-2 text-center text-sm text-neutral-500"
            data-testid="practice-mouth-open"
          >
            การเปิดปาก: {mouthOpen}%
            {mouthSamplesRef.current.length > 1 && (
              <span className="ml-2 text-neutral-400">
                (เฉลี่ย: {avgMouthOpen || "..."}%)
              </span>
            )}
          </p>
        </div>

        {/* Lip example panel */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Smile className="h-4 w-4" />
            <span>ตัวอย่างริมฝีปาก</span>
          </div>

          <LipExample visemeGroup={word.viseme_group} />
        </div>
      </div>

      {/* Speech status */}
      {(listening || speechError || transcript) && (
        <div className="mt-4 text-center text-sm">
          {listening && <p className="text-green-600">กำลังฟัง...</p>}
          {speechError && <p className="text-amber-600">{speechError}</p>}
        </div>
      )}

      {!result && (
        <div className="mt-8 flex flex-col items-center">
          {!practicing ? (
            <Button
              onClick={handleStartPractice}
              data-testid="practice-camera-btn"
              className="h-10 rounded-lg bg-black px-5 text-sm font-bold text-white hover:bg-neutral-800"
            >
              <Play className="mr-2 h-4 w-4 fill-white" />
              เริ่มการฝึกออกเสียง
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !readyToSubmit}
                data-testid="practice-submit"
                className="h-10 rounded-lg bg-green-600 px-5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? "กำลังส่งผล..." : "ส่งผล"}
              </Button>
              {practicing && !readyToSubmit && !speechError && (
                <p className="mt-2 text-xs text-amber-600">
                  {!transcript && mouthOpen <= 0
                    ? "กรุณาเปิดกล้องและพูดเพื่อบันทึกผล"
                    : !transcript
                      ? "กรุณาพูดเพื่อบันทึกเสียง"
                      : "กรุณาเปิดกล้องให้เห็นรูปปาก"}
                </p>
              )}
            </>
          )}

          <Button
            variant="ghost"
            onClick={onSkip}
            className="mt-3 h-8 text-sm font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-700"
          >
            {isLast ? "จบบทเรียน" : "คำถัดไป"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {result && (
        <div
          className="mt-8 rounded-xl border border-neutral-300 bg-white p-6"
          data-testid="score-card"
        >
          <h2 className="mb-4 text-center text-lg font-semibold text-neutral-900">
            ผลการฝึก
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-neutral-500">คะแนนภาพ</p>
              <p className="text-2xl font-bold text-primary">
                {result.visual_score}
              </p>
              <p className="text-xs text-neutral-400">/100</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">คะแนนเสียง</p>
              <p className="text-2xl font-bold text-green-600">
                {result.audio_score}
              </p>
              <p className="text-xs text-neutral-400">/100</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">คะแนนรวม</p>
              <p className="text-2xl font-bold text-amber-600">
                {result.total_score}
              </p>
              <p className="text-xs text-neutral-400">/100</p>
            </div>
          </div>

          {result.feedback_th && (
            <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center text-sm text-neutral-600">
              {result.feedback_th}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleTryAgain}
              data-testid="try-again"
              className="flex-1 rounded-md bg-black px-4 py-2 text-white font-medium hover:bg-neutral-800"
            >
              ลองอีกครั้ง
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 h-12 px-4 text-sm font-semibold"
            >
              {isLast ? "จบบทเรียน" : "คำถัดไป"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
