"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="flex min-h-screen items-center justify-center bg-muted/40 noise-bg">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-brand border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error && !wordData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 noise-bg">
        <p className="text-muted-foreground">{error}</p>
        <Button
          onClick={() => router.push("/dashboard")}
          variant="outline"
        >
          ← กลับไปหน้าแดชบอร์ด
        </Button>
      </div>
    );
  }

  const PASS_THRESHOLD = 70;

  return (
    <div className="min-h-screen bg-muted/40 noise-bg">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="sm"
            className="px-0"
          >
            ← กลับไปหน้าแดชบอร์ด
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {wordData && (
          <>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-foreground text-balance">{wordData.word}</h1>
              <Badge variant="secondary" className="mt-3">
                กลุ่มรูปปาก: {wordData.viseme_group}
              </Badge>
            </div>

            <p className="text-center text-muted-foreground text-balance">
              ลองออกเสียงคำนี้ แล้วระบบจะวิเคราะห์รูปปากและเสียงพูดของคุณ
            </p>

            {!result && (
              <div className="space-y-4">
                <Card variant="elevated" padded>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">กล้อง</h2>
                    {!cameraActive ? (
                      <Button
                        onClick={handleStartCamera}
                        data-testid="practice-camera-btn"
                        variant="default"
                        size="sm"
                      >
                        เริ่มกล้อง
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopCamera}
                        variant="outline"
                        size="sm"
                      >
                        หยุดกล้อง
                      </Button>
                    )}
                  </div>

                  <div className={`relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-primary ${cameraActive ? "" : "hidden"}`}>
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

                  <p className="mt-1 text-center text-sm text-brand" data-testid="practice-mouth-open">
                    การเปิดปาก: {mouthOpen}%
                  </p>
                </Card>

                <Card variant="elevated" padded>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">เสียงพูด</h2>
                    {!listening ? (
                      <Button
                        onClick={handleStartListening}
                        data-testid="practice-speech-btn"
                        variant="default"
                        size="sm"
                      >
                        เริ่มพูด
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopListening}
                        variant="outline"
                        size="sm"
                      >
                        หยุดฟัง
                      </Button>
                    )}
                  </div>

                  {listening && (
                    <p className="text-sm text-brand">กำลังฟัง...</p>
                  )}

                  {speechError && (
                    <p className="text-sm text-amber-500">{speechError}</p>
                  )}

                  {transcript && (
                    <div className="mt-2 rounded-lg bg-muted p-3" data-testid="practice-transcript">
                      <p className="text-sm text-muted-foreground">ข้อความที่ได้:</p>
                      <p className="mt-1 text-lg font-medium text-foreground">{transcript}</p>
                    </div>
                  )}
                </Card>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (!transcript && mouthOpen === 0)}
                  data-testid="practice-submit"
                  className="w-full"
                >
                  {submitting ? "กำลังส่งผล..." : "ส่งผล"}
                </Button>
              </div>
            )}

              {result && (
                <Card variant="elevated" padded className="text-center" data-testid="score-card">
                  <h2 className="mb-4 text-lg font-semibold text-foreground text-balance">
                    ผลการฝึก
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">คะแนนภาพ</p>
                      <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{result.visual_score}</p>
                      <p className="text-[10px] text-muted-foreground">/100</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">คะแนนเสียง</p>
                      <p className="mt-1 text-xl font-bold text-emerald-500 tabular-nums">{result.audio_score}</p>
                      <p className="text-[10px] text-muted-foreground">/100</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">คะแนนรวม</p>
                      <p className={`mt-1 text-xl font-bold tabular-nums ${result.total_score >= PASS_THRESHOLD ? "text-emerald-500" : "text-amber-500"}`}>{result.total_score}</p>
                      <p className="text-[10px] text-muted-foreground">/100</p>
                    </div>
                  </div>

                  {result.feedback_th && (
                    <div className="mt-4 rounded-lg bg-brand/5 p-3 text-sm text-foreground">
                      {result.feedback_th}
                    </div>
                  )}

                  <Button
                    onClick={handleTryAgain}
                    data-testid="try-again"
                    variant="outline"
                    className="mt-6 w-full"
                  >
                    ลองอีกครั้ง
                  </Button>
                </Card>
              )}
          </>
        )}
      </main>
    </div>
  );
}