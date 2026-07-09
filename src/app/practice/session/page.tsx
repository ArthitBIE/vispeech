"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";

interface WordRow {
  id: string
  word: string
  viseme_group: string
  difficulty: number
}

interface ScoreResult {
  visual_score: number
  audio_score: number
  total_score: number
  feedback_th: string
}

interface Attempt {
  word: WordRow
  score: ScoreResult
  passed: boolean
}

type SessionPhase =
  | "loading"
  | "ready"
  | "face-warning"
  | "practicing"
  | "scored"
  | "summary"

const MAX_ATTEMPTS = 12
const ACTIVE_SET_SIZE = 3
const PASS_THRESHOLD = 70

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function SessionPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [phase, setPhase] = useState<SessionPhase>("loading")
  const [allWords, setAllWords] = useState<WordRow[]>([])
  const [activeWords, setActiveWords] = useState<WordRow[]>([])
  const [currentWord, setCurrentWord] = useState<WordRow | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set())

  const [cameraActive, setCameraActive] = useState(false)
  const [faceMesh, setFaceMesh] = useState<FaceMeshInstance | null>(null)
  const [mouthOpen, setMouthOpen] = useState(0)
  const [hasFace, setHasFace] = useState(true)

  const [listening, setListening] = useState(false)
  const [recognizer, setRecognizer] = useState<SpeechRecognizer | null>(null)
  const [transcript, setTranscript] = useState("")
  const [speechError, setSpeechError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null)
  const [lastPassed, setLastPassed] = useState(false)

  const mouthOpenRef = useRef(0)
  const hasFaceRef = useRef(true)
  const phaseRef = useRef<SessionPhase>("loading")
  const sessionSavedRef = useRef(false)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { mouthOpenRef.current = mouthOpen }, [mouthOpen])
  useEffect(() => { hasFaceRef.current = hasFace }, [hasFace])

  useEffect(() => {
    initSession()
    return () => {
      faceMesh?.stop()
      recognizer?.stop()
    }
  }, [])

  async function initSession() {
    try {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) { router.push("/auth"); return }

      const res = await fetch("/api/words", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch words")
      const { words } = await res.json()
      const mapped: WordRow[] = words.map((w: any) => ({
        id: w.id,
        word: w.text,
        viseme_group: w.visemeGroup,
        difficulty: w.difficulty,
      }))
      if (mapped.length === 0) throw new Error("No words available")

      setAllWords(mapped)
      const initial = pickRandom(mapped, Math.min(ACTIVE_SET_SIZE, mapped.length))
      setActiveWords(initial)
      setCurrentWord(initial[0])
      setPhase("ready")
    } catch {
      setPhase("ready")
    }
  }

  async function handleStartPractice() {
    if (!videoRef.current || !canvasRef.current || !currentWord) return
    faceMesh?.stop()
    recognizer?.stop()
    setTranscript("")
    setMouthOpen(0)
    setLastResult(null)
    setSpeechError(null)
    setHasFace(true)

    const instance = await initFaceMesh(videoRef.current, canvasRef.current)
    instance.onResult((res) => {
      setMouthOpen(res.mouthOpen)
      setHasFace(res.hasFace)
    })
    try {
      await instance.start()
      setFaceMesh(instance)
    } catch {
      instance.stop()
    }
    setCameraActive(true)
    setPhase("practicing")

    setTimeout(() => {
      if (!hasFaceRef.current && phaseRef.current === "practicing") {
        setPhase("face-warning")
      }
    }, 3000)
  }

  function handleStartListening() {
    if (speechError) setSpeechError(null)
    const sr = createSpeechRecognizer("th-TH")
    sr.onResult((res) => setTranscript(res.transcript))
    sr.onError((msg) => { setSpeechError(msg); setListening(false) })
    sr.start()
    setRecognizer(sr)
    setListening(true)
  }

  async function handleStopListening() {
    if (!recognizer) return
    const final = await recognizer.stop()
    setTranscript((prev) => prev || final)
    setListening(false)
  }

  async function handleSubmit() {
    if (!currentWord || submitting) return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase!.auth.getSession()
      if (!session) { router.push("/auth"); return }

      const { data: { session: scoreSession } } = await supabase!.auth.getSession()
      const scoreHeaders: Record<string, string> = { "Content-Type": "application/json" }
      if (scoreSession?.access_token) {
        scoreHeaders["Authorization"] = `Bearer ${scoreSession.access_token}`
      }
      const res = await fetch("/api/score", {
        method: "POST",
        headers: scoreHeaders,
        body: JSON.stringify({
          wordId: currentWord.id,
          transcript,
          mouthOpen,
        }),
      })
      if (!res.ok) throw new Error("Score API failed")
      const score: ScoreResult = await res.json()
      const passed = score.total_score >= PASS_THRESHOLD

      const attempt: Attempt = { word: currentWord, score, passed }
      const newAttempts = [...attempts, attempt]
      const newPassed = new Set(passedIds)

      if (passed) newPassed.add(currentWord.id)

      let nextActive = [...activeWords]
      const currentIdx = nextActive.findIndex((w) => w.id === currentWord.id)

      if (passed && currentIdx >= 0) {
        nextActive.splice(currentIdx, 1)
        const remaining = allWords.filter(
          (w) => !newPassed.has(w.id) && !nextActive.some((a) => a.id === w.id),
        )
        if (remaining.length > 0) {
          const [replacement] = pickRandom(remaining, 1)
          nextActive.push(replacement)
        }
      }

      const nextWord =
        nextActive.length > 0
          ? nextActive[newAttempts.length % nextActive.length]
          : null

      setAttempts(newAttempts)
      setPassedIds(newPassed)
      setActiveWords(nextActive)
      setLastResult(score)
      setLastPassed(passed)

      if (newAttempts.length >= MAX_ATTEMPTS || nextActive.length === 0 || !nextWord) {
        stopMedia()
        saveSession(newAttempts)
      } else {
        setCurrentWord(nextWord)
        setPhase("scored")
      }
    } catch {
      setSpeechError("เกิดข้อผิดพลาดในการส่งคะแนน")
    } finally {
      setSubmitting(false)
    }
  }

  async function saveSession(attempts: Attempt[]) {
    if (sessionSavedRef.current) return
    sessionSavedRef.current = true
    const p = attempts.filter((a) => a.passed).length
    const b = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score.total_score)) : 0
    try {
      const { data: { session } } = await supabase!.auth.getSession()
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      await fetch("/api/practice-sessions", {
        method: "POST",
        headers,
        body: JSON.stringify({ totalAttempts: attempts.length, passedCount: p, bestScore: b }),
      })
    } catch (err) {
      console.error("Failed to save session:", err)
    }
    setPhase("summary")
  }

  function stopMedia() {
    faceMesh?.stop()
    setFaceMesh(null)
    setCameraActive(false)
    recognizer?.stop()
    setRecognizer(null)
    setListening(false)
  }

  function handleNextWord() {
    setLastResult(null)
    setTranscript("")
    setMouthOpen(0)
    setPhase("ready")
    stopMedia()
  }

  function handleFinish() {
    stopMedia()
    saveSession(attempts)
  }

  const passedCount = attempts.filter((a) => a.passed).length
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map((a) => a.score.total_score))
    : 0

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">กำลังเตรียมเซสชัน...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            ← ออกจากเซสชัน
          </button>
          {phase !== "summary" && (
            <div className="flex gap-5 text-sm text-slate-400">
              <span>พยายาม: {attempts.length}/{MAX_ATTEMPTS}</span>
              <span>ผ่าน: {passedCount}</span>
              <span>คำรอ: {activeWords.length}</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        {phase === "summary" ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <h1 className="text-2xl font-bold text-slate-800">จบเซสชัน!</h1>
              <p className="mt-2 text-slate-400">สรุปผลการฝึกของคุณ</p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <p className="text-sm text-slate-400">พยายามทั้งหมด</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-500">
                  {attempts.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <p className="text-sm text-slate-400">คำที่ผ่าน</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-500">
                  {passedCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-5 text-center shadow-sm">
                <p className="text-sm text-slate-400">คะแนนสูงสุด</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-indigo-500">
                  {bestScore}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-700">รายละเอียด</h2>
              <div className="space-y-3">
                {attempts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          a.passed ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-400"
                        }`}
                      >
                        {a.passed ? "✓" : "✗"}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{a.word.word}</p>
                        <p className="text-xs text-slate-400">
                          ภาพ {a.score.visual_score} | เสียง {a.score.audio_score}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold tabular-nums ${
                        a.passed ? "text-emerald-500" : "text-red-400"
                      }`}
                    >
                      {a.score.total_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"
            >
              กลับไปแดชบอร์ด
            </button>
          </div>
        ) : lastResult && phase === "scored" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
              <p
                className={`text-lg font-semibold ${
                  lastPassed ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {lastPassed ? "✅ ผ่าน!" : "🔄 ลองใหม่"}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-5">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">ภาพ</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-indigo-500">
                    {lastResult.visual_score}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">เสียง</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-500">
                    {lastResult.audio_score}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">รวม</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-indigo-500">
                    {lastResult.total_score}
                  </p>
                </div>
              </div>
              {lastResult.feedback_th && (
                <p className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 text-sm text-slate-600">
                  {lastResult.feedback_th}
                </p>
              )}
            </div>
            <button
              onClick={handleNextWord}
              className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"
            >
              คำถัดไป
            </button>
            <button
              onClick={handleFinish}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              จบเซสชัน
            </button>
          </div>
        ) : phase === "face-warning" ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="mb-4 text-4xl">😶</p>
              <h2 className="text-lg font-semibold text-slate-700">
                ไม่พบใบหน้าของคุณ
              </h2>
              <p className="mt-2 text-slate-400">
                กรุณาให้กล้องเห็นใบหน้าของคุณ แล้วกดตรวจสอบอีกครั้ง
              </p>
              <button
                onClick={() => {
                  if (hasFaceRef.current) {
                    setPhase("practicing")
                  } else {
                    setTimeout(() => {
                      if (hasFaceRef.current) setPhase("practicing")
                    }, 2000)
                  }
                }}
                className="mt-6 rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 transition-colors"
              >
                ตรวจสอบอีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentWord && (
              <div className="text-center">
                <div className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-500">
                  {currentWord.viseme_group}
                </div>
                <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-800">
                  {currentWord.word}
                </h1>
                {phase === "ready" && (
                  <p className="mt-3 text-slate-400">
                    เตรียมตัวออกเสียงคำนี้
                  </p>
                )}
              </div>
            )}

            {phase === "ready" && (
              <button
                onClick={handleStartPractice}
                className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors"
              >
                เริ่มฝึกคำนี้
              </button>
            )}

            {/* Always rendered so videoRef exists for handleStartPractice */}
            <div className={`${phase !== "practicing" ? "hidden" : ""}`}>
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
            </div>

            {phase === "practicing" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">กล้อง</h2>
                    <button
                      onClick={() => { faceMesh?.stop(); setCameraActive(false); setPhase("ready") }}
                      className="rounded-lg bg-red-50 px-4 py-1.5 text-xs font-medium text-red-400 hover:bg-red-100 transition-colors"
                    >
                      หยุดกล้อง
                    </button>
                  </div>

                  {!hasFace && (
                    <p className="mt-3 text-center text-sm text-amber-500">
                      กรุณาให้ใบหน้าอยู่ในกรอบกล้อง
                    </p>
                  )}
                  <p className="mt-2 text-center text-sm tabular-nums text-indigo-500">
                    การเปิดปาก: {mouthOpen}%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-700">เสียงพูด</h2>
                    {!listening ? (
                      <button
                        onClick={handleStartListening}
                        className="rounded-lg bg-indigo-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-600 transition-colors"
                      >
                        เริ่มพูด
                      </button>
                    ) : (
                      <button
                        onClick={handleStopListening}
                        className="rounded-lg bg-red-50 px-4 py-1.5 text-xs font-medium text-red-400 hover:bg-red-100 transition-colors"
                      >
                        หยุดฟัง
                      </button>
                    )}
                  </div>

                  {listening && (
                    <p className="text-sm text-emerald-500">กำลังฟัง...</p>
                  )}
                  {speechError && (
                    <p className="text-sm text-amber-500">{speechError}</p>
                  )}
                  {transcript && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">ข้อความที่ได้:</p>
                      <p className="mt-1 text-lg font-medium text-slate-800">
                        {transcript}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || (!transcript && mouthOpen === 0)}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "กำลังส่ง..." : "ส่งผล"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
