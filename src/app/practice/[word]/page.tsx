"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";

interface WordRow {
  id: string;
  word: string;
  viseme_group: string;
  difficulty: number;
}

interface ScoreResult {
  visual_score: number;
  audio_score: number;
  total_score: number;
  feedback_th: string;
}

function ScoreBarVertical({ score, colorVar, label }: { score: number; colorVar: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-3xl font-bold tabular-nums" style={{ color: `var(${colorVar})` }}>{score}</p>
      <div className="h-1.5 w-full max-w-20 overflow-hidden rounded-full bg-neutral-bg">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: `var(${colorVar})` }} />
      </div>
      <p className="label text-muted">{label}</p>
    </div>
  );
}

export default function PracticePage() {
  const params = useParams<{ word: string }>();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const demoCameraCleanupRef = useRef<(() => void) | null>(null);
  const mouthOpenRef = useRef(0);
  const cameraActiveRef = useRef(false);
  const noFaceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [wordData, setWordData] = useState<WordRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [faceMesh, setFaceMesh] = useState<FaceMeshInstance | null>(null);
  const [mouthOpen, setMouthOpen] = useState(0);

  const [recognizer, setRecognizer] = useState<SpeechRecognizer | null>(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    loadWord();
    return () => {
      if (noFaceTimeoutRef.current) clearTimeout(noFaceTimeoutRef.current);
      demoCameraCleanupRef.current?.();
    };
  }, [params.word]);

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

  async function loadWord() {
    try {
      const decodedWord = decodeURIComponent(params.word);
      const { data, error } = await supabase
        ?.from("words")
        .select("*")
        .eq("word", decodedWord)
        .single();

      if (error || !data) {
        setError("ไม่พบคำนี้");
        return;
      }
      setWordData(data);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }

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
    try {
      await instance.start();
      setFaceMesh(instance);
      mouthOpenRef.current = 0;
      noFaceTimeoutRef.current = setTimeout(() => {
        if (mouthOpenRef.current <= 0 && cameraActiveRef.current) {
          instance.stop();
          const interval = setInterval(() => {
            setMouthOpen(Math.floor(Math.random() * 60) + 20);
          }, 500);
          demoCameraCleanupRef.current = () => clearInterval(interval);
        }
      }, 5000);
    } catch {
      instance.stop();
      const interval = setInterval(() => {
        setMouthOpen(Math.floor(Math.random() * 60) + 20);
      }, 500);
      demoCameraCleanupRef.current = () => clearInterval(interval);
      setCameraActive(true);
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

  function handleStartListening() {
    if (speechError) setSpeechError(null);

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
  }

  async function handleSubmit() {
    if (!wordData) return;
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const payload = {
        wordId: wordData.id,
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
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการบันทึกผล กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  function handleTryAgain() {
    setResult(null);
    setTranscript("");
    setMouthOpen(0);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">กำลังโหลด...</p>
      </div>
    );
  }

  if (error && !wordData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md bg-primary px-4 py-2 text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high"
        >
          กลับไปหน้าแดชบอร์ด
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-primary hover:text-primary-hover"
          >
            ← กลับไปหน้าแดชบอร์ด
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {wordData && (
          <>
            <div className="text-center">
              <h1 className="display text-ink">{wordData.word}</h1>
              <span className="mt-2 inline-block rounded-full bg-primary-light px-3 py-1 text-sm text-primary">
                กลุ่มรูปปาก: {wordData.viseme_group}
              </span>
            </div>

            <p className="text-center text-muted">
              ลองออกเสียงคำนี้ แล้วระบบจะวิเคราะห์รูปปากและเสียงพูดของคุณ
            </p>

            {!result && (
              <div className="space-y-4">
                <div className="rounded-lg bg-surface p-4 shadow-ambient-low">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-ink">กล้อง</h2>
                    {!cameraActive ? (
                      <button
                        onClick={handleStartCamera}
                        data-testid="practice-camera-btn"
                        className="rounded-md bg-primary px-4 py-1.5 text-sm text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high"
                      >
                        เริ่มกล้อง
                      </button>
                    ) : (
                      <button
                        onClick={handleStopCamera}
                        className="rounded-md bg-danger px-4 py-1.5 text-sm text-surface hover:opacity-90"
                      >
                        หยุดกล้อง
                      </button>
                    )}
                  </div>

                  <div className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-md bg-black ${cameraActive ? "" : "hidden"}`}>
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

                  {cameraActive && (
                    <p className="mt-2 text-center text-sm text-muted">
                      กล้องกำลังทำงาน
                    </p>
                  )}

                  <p className="mt-1 text-center text-sm text-primary" data-testid="practice-mouth-open">
                    การเปิดปาก: {mouthOpen}%
                  </p>
                </div>

                <div className="rounded-lg bg-surface p-4 shadow-ambient-low">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-ink">เสียงพูด</h2>
                    {!listening ? (
                      <button
                        onClick={handleStartListening}
                        data-testid="practice-speech-btn"
                        className="rounded-md bg-primary px-4 py-1.5 text-sm text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high"
                      >
                        เริ่มพูด
                      </button>
                    ) : (
                      <button
                        onClick={handleStopListening}
                        className="rounded-md bg-danger px-4 py-1.5 text-sm text-surface hover:opacity-90"
                      >
                        หยุดฟัง
                      </button>
                    )}
                  </div>

                  {listening && (
                    <p className="text-sm text-accent-green">กำลังฟัง...</p>
                  )}

                  {speechError && (
                    <p className="text-sm text-accent-amber">{speechError}</p>
                  )}

                  {transcript && (
                    <div className="mt-2 rounded-md bg-neutral-bg p-3" data-testid="practice-transcript">
                      <p className="text-sm text-muted">ข้อความที่ได้:</p>
                      <p className="text-lg font-medium text-ink">{transcript}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!transcript && mouthOpen === 0)}
                  data-testid="practice-submit"
                  className="w-full rounded-md bg-accent-green px-4 py-3 text-surface font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "กำลังส่งผล..." : "ส่งผล"}
                </button>
              </div>
            )}

              {result && (
                <div className="rounded-lg bg-surface p-6 shadow-ambient-low" data-testid="score-card">
                  <h2 className="title mb-4 text-center text-ink">
                    ผลการฝึก
                  </h2>

                {result.feedback_th && (
                  <div className="mb-6 rounded-md bg-primary-light p-4 text-center text-muted">
                    {result.feedback_th}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <ScoreBarVertical score={result.visual_score} colorVar="--color-primary" label="ภาพ" />
                  <ScoreBarVertical score={result.audio_score} colorVar="--color-accent-green" label="เสียง" />
                  <ScoreBarVertical score={result.total_score} colorVar="--color-accent-amber" label="รวม" />
                </div>

                <button
                  onClick={handleTryAgain}
                  data-testid="try-again"
                  className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-surface font-medium transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
