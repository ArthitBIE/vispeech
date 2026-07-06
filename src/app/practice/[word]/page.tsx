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
  }, [params.word]);

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
    if (!videoRef.current || !canvasRef.current) return;

    const instance = await initFaceMesh(videoRef.current, canvasRef.current);
    instance.onResult((res) => {
      setMouthOpen(res.mouthOpen);
    });
    await instance.start();
    setFaceMesh(instance);
    setCameraActive(true);
  }

  function handleStopCamera() {
    faceMesh?.stop();
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
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  if (error && !wordData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          กลับไปหน้าแดชบอร์ด
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← กลับไปหน้าแดชบอร์ด
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {wordData && (
          <>
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-900">{wordData.word}</h1>
              <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700">
                กลุ่มรูปปาก: {wordData.viseme_group}
              </span>
            </div>

            <p className="text-center text-gray-600">
              ลองออกเสียงคำนี้ แล้วระบบจะวิเคราะห์รูปปากและเสียงพูดของคุณ
            </p>

            {!result && (
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">กล้อง</h2>
                    {!cameraActive ? (
                      <button
                        onClick={handleStartCamera}
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
                      >
                        เริ่มกล้อง
                      </button>
                    ) : (
                      <button
                        onClick={handleStopCamera}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
                      >
                        หยุดกล้อง
                      </button>
                    )}
                  </div>

                  {cameraActive && (
                    <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-black">
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

                  {cameraActive && (
                    <p className="mt-2 text-center text-sm text-gray-500">
                      กล้องกำลังทำงาน
                    </p>
                  )}

                  {mouthOpen > 0 && (
                    <p className="mt-1 text-center text-sm text-indigo-600">
                      การเปิดปาก: {mouthOpen}%
                    </p>
                  )}
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">เสียงพูด</h2>
                    {!listening ? (
                      <button
                        onClick={handleStartListening}
                        className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm text-white hover:bg-indigo-700"
                      >
                        เริ่มพูด
                      </button>
                    ) : (
                      <button
                        onClick={handleStopListening}
                        className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
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
                    <div className="mt-2 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm text-gray-500">ข้อความที่ได้:</p>
                      <p className="text-lg font-medium text-gray-900">{transcript}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!transcript && mouthOpen === 0)}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? "กำลังส่งผล..." : "ส่งผล"}
                </button>
              </div>
            )}

            {result && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
                  ผลการฝึก
                </h2>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">คะแนนภาพ</p>
                    <p className="text-2xl font-bold text-indigo-600">{result.visual_score}</p>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">คะแนนเสียง</p>
                    <p className="text-2xl font-bold text-green-600">{result.audio_score}</p>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">คะแนนรวม</p>
                    <p className="text-2xl font-bold text-amber-600">{result.total_score}</p>
                    <p className="text-xs text-gray-400">/100</p>
                  </div>
                </div>

                {result.feedback_th && (
                  <div className="mt-4 rounded-lg bg-indigo-50 p-3 text-center text-sm text-gray-700">
                    {result.feedback_th}
                  </div>
                )}

                <button
                  onClick={handleTryAgain}
                  className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700"
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
