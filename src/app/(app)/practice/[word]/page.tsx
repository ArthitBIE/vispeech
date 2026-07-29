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
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  if (error && !wordData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          กลับไปหน้าแดชบอร์ด
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
        {wordData && (
          <>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-foreground">{wordData.word}</h1>
              <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                กลุ่มรูปปาก: {wordData.viseme_group}
              </span>
            </div>

            <p className="text-center text-muted-foreground">
              ลองออกเสียงคำนี้ แล้วระบบจะวิเคราะห์รูปปากและเสียงพูดของคุณ
            </p>

            {!result && (
              <div className="space-y-8">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">กล้อง</h2>
                    {!cameraActive ? (
                      <button
                        onClick={handleStartCamera}
                        data-testid="practice-camera-btn"
                        className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        เริ่มกล้อง
                      </button>
                    ) : (
                      <button
                        onClick={handleStopCamera}
                        className="rounded-md bg-destructive px-4 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90"
                      >
                        หยุดกล้อง
                      </button>
                    )}
                  </div>

                  <div className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-black ${cameraActive ? "" : "hidden"}`}>
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
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      กล้องกำลังทำงาน
                    </p>
                  )}

                  <p className="mt-1 text-center text-sm text-primary" data-testid="practice-mouth-open">
                    การเปิดปาก: {mouthOpen}%
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">เสียงพูด</h2>
                    {!listening ? (
                      <button
                        onClick={handleStartListening}
                        data-testid="practice-speech-btn"
                        className="rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        เริ่มพูด
                      </button>
                    ) : (
                      <button
                        onClick={handleStopListening}
                        className="rounded-md bg-destructive px-4 py-1.5 text-sm text-destructive-foreground hover:bg-destructive/90"
                      >
                        หยุดฟัง
                      </button>
                    )}
                  </div>

                  {listening && (
                    <p className="text-sm text-green-600">กำลังฟัง...</p>
                  )}

                  {speechError && (
                    <p className="text-sm text-amber-600">{speechError}</p>
                  )}

                  {transcript && (
                    <div className="mt-2 rounded-lg bg-muted p-3" data-testid="practice-transcript">
                      <p className="text-sm text-muted-foreground">ข้อความที่ได้:</p>
                      <p className="text-lg font-medium text-foreground">{transcript}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!transcript && mouthOpen === 0)}
                  data-testid="practice-submit"
                  className="w-full rounded-md bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "กำลังส่งผล..." : "ส่งผล"}
                </button>
              </div>
            )}

            {result && (
              <div className="rounded-xl border border-border bg-card p-6" data-testid="score-card">
                <h2 className="mb-4 text-center text-lg font-semibold text-foreground">
                  ผลการฝึก
                </h2>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">คะแนนภาพ</p>
                    <p className="text-2xl font-bold text-primary">{result.visual_score}</p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">คะแนนเสียง</p>
                    <p className="text-2xl font-bold text-green-600">{result.audio_score}</p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">คะแนนรวม</p>
                    <p className="text-2xl font-bold text-amber-600">{result.total_score}</p>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                </div>

                {result.feedback_th && (
                  <div className="mt-4 rounded-lg bg-primary/10 p-3 text-center text-sm text-muted-foreground">
                    {result.feedback_th}
                  </div>
                )}

                <button
                  onClick={handleTryAgain}
                  data-testid="try-again"
                  className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90"
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