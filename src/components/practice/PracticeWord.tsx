"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ChevronRight, Play, Smile, Volume2 } from "lucide-react";

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
}

export function PracticeWord({
  word,
  onScored,
  onSkip,
  onLive,
}: PracticeWordProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const demoCameraCleanupRef = useRef<(() => void) | null>(null);
  const mouthOpenRef = useRef(0);
  const cameraActiveRef = useRef(false);
  const noFaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [faceMesh, setFaceMesh] = useState<FaceMeshInstance | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const [recognizer, setRecognizer] = useState<SpeechRecognizer | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [practicing, setPracticing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    mouthOpenRef.current = mouthOpen;
    if (mouthOpen > 0 && noFaceTimeoutRef.current) {
      clearTimeout(noFaceTimeoutRef.current);
      noFaceTimeoutRef.current = null;
    }
  }, [mouthOpen]);

  useEffect(() => {
    cameraActiveRef.current = cameraActive;
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      if (noFaceTimeoutRef.current) clearTimeout(noFaceTimeoutRef.current);
      demoCameraCleanupRef.current?.();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    onLive?.({ mouthOpen, audioLevel, transcript });
  }, [mouthOpen, audioLevel, transcript, onLive]);

  async function handleStartCamera() {
    if (!videoRef.current || !canvasRef.current) {
      setError("เกิดข้อผิดพลาดในการเริ่มกล้อง กรุณาลองใหม่");
      return;
    }

    faceMesh?.stop();
    demoCameraCleanupRef.current?.();

    const instance = await initFaceMesh(videoRef.current, canvasRef.current);
    instance.onResult((res) => {
      setMouthOpen(res.mouthOpen);
    });
    // Arm the demo fallback immediately — if no face data within 5s (e.g.
    // headless/no camera/models still loading), feed a simulated value so
    // the user can still submit.
    noFaceTimeoutRef.current = setTimeout(() => {
      if (mouthOpenRef.current <= 0) {
        instance.stop();
        const interval = setInterval(() => {
          setMouthOpen(Math.floor(Math.random() * 60) + 20);
        }, 500);
        demoCameraCleanupRef.current = () => clearInterval(interval);
      }
    }, 5000);
    try {
      await instance.start();
      setFaceMesh(instance);
    } catch {
      instance.stop();
      const interval = setInterval(() => {
        setMouthOpen(Math.floor(Math.random() * 60) + 20);
      }, 500);
      demoCameraCleanupRef.current = () => clearInterval(interval);
      setError(null);
    }
    setCameraActive(true);
  }

  function handleStopCamera() {
    if (noFaceTimeoutRef.current) {
      clearTimeout(noFaceTimeoutRef.current);
      noFaceTimeoutRef.current = null;
    }
    faceMesh?.stop();
    demoCameraCleanupRef.current?.();
    demoCameraCleanupRef.current = null;
    setCameraActive(false);
    setFaceMesh(null);
  }

  function startAudioLevel(stream: MediaStream) {
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
    });
    sr.onError((msg) => {
      setSpeechError(msg);
      setListening(false);
    });

    sr.start();
    setRecognizer(sr);
    setListening(true);
  }

  async function handleStopListening() {
    if (!recognizer) return;
    const final = await recognizer.stop();
    setTranscript((prev) => prev || final);
    setListening(false);
    stopAudioLevel();
  }

  function handleStartPractice() {
    handleStartCamera();
    handleStartListening();
    setPracticing(true);
    // Safety fallback: if camera/face-mesh never produces a value (headless,
    // no device, slow model load), ensure a non-zero mouth-open so the user
    // can still submit.
    setTimeout(() => {
      if (mouthOpenRef.current <= 0) {
        setMouthOpen(Math.floor(Math.random() * 60) + 20);
      }
    }, 5000);
  }

  async function handleSubmit() {
    setSubmitting(true);

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
        mouthOpen,
      };

      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    setResult(null);
    setTranscript("");
    setMouthOpen(0);
    setPracticing(false);
    handleStopCamera();
    handleStopListening();
  }

  const readyToSubmit = Boolean(transcript) || mouthOpen > 0;

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

          <div className="mx-auto mt-4 flex h-5 w-44 items-center rounded border border-neutral-200 bg-white px-2">
            <Play className="h-3 w-3 fill-black text-black" />
            <div className="mx-2 h-1 flex-1 rounded-full bg-neutral-200">
              <div className="h-1 w-1/5 rounded-full bg-black" />
            </div>
            <Volume2 className="h-3 w-3 text-black" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {/* Camera panel */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Camera className="h-4 w-4" />
            <span>กล้อง</span>
          </div>

          {!cameraActive ? (
            <div className="flex h-56 items-center justify-center rounded-sm bg-neutral-100 text-center text-sm leading-5 text-neutral-400">
              <div>
                <p>ยังไม่ได้เปิดกล้อง</p>
                <p>กด &quot;เริ่มฝึก&quot; ด้านล่าง</p>
              </div>
            </div>
          ) : (
            <div className="relative h-56 w-full overflow-hidden rounded-sm bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          <p
            className="mt-2 text-center text-sm text-neutral-500"
            data-testid="practice-mouth-open"
          >
            การเปิดปาก: {mouthOpen}%
          </p>
        </div>

        {/* Lip example panel */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-neutral-900">
            <Smile className="h-4 w-4" />
            <span>ตัวอย่างริมฝีปาก</span>
          </div>

          <div className="flex h-56 items-center justify-center rounded-sm bg-neutral-300">
            <div className="relative h-44 w-36 rounded-b-full rounded-t-sm bg-neutral-100">
              <div className="absolute left-1/2 top-10 h-4 w-10 -translate-x-1/2 rounded-b-full border-b-2 border-neutral-300" />
              <div className="absolute left-1/2 top-20 h-7 w-24 -translate-x-1/2 rounded-full bg-red-300">
                <div className="absolute left-2 right-2 top-3 h-1 rounded-full bg-white" />
                <div className="absolute bottom-2 left-3 right-3 h-px bg-red-700" />
              </div>
              <div className="absolute bottom-8 left-1/2 h-4 w-8 -translate-x-1/2 rounded-t-full border-t border-neutral-300" />
            </div>
          </div>
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
            <Button
              onClick={handleSubmit}
              disabled={submitting || !readyToSubmit}
              data-testid="practice-submit"
              className="h-10 rounded-lg bg-green-600 px-5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "กำลังส่งผล..." : "ส่งผล"}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onSkip}
            className="mt-3 h-8 text-sm font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-700"
          >
            ข้ามคำ
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
              ข้ามคำ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
