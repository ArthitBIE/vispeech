"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { initFaceMesh } from "@/lib/mediapipe";
import { createSpeechRecognizer } from "@/lib/viseme";
import type { FaceMeshInstance } from "@/lib/mediapipe";
import type { SpeechRecognizer } from "@/lib/viseme";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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
        <p className="text-muted-foreground">กำลังเตรียมเซสชัน...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => router.push("/dashboard")}
          >
            ← ยกเลิกการฝึก
          </Button>
          {phase !== "summary" && (
            <div className="flex gap-5 text-sm text-muted-foreground">
              <span>พยายาม: {attempts.length}/{MAX_ATTEMPTS}</span>
              <span>ผ่าน: {passedCount}</span>
              <span>คำรอ: {activeWords.length}</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {phase === "summary" ? (
          <div className="space-y-6">
            <Card className="p-10 text-center">
              <h1 className="text-2xl font-bold">จบเซสชัน!</h1>
              <p className="mt-2 text-muted-foreground">สรุปผลการฝึกของคุณ</p>
            </Card>

            <div className="grid grid-cols-3 gap-5">
              <Card className="p-5 text-center">
                <p className="text-sm text-muted-foreground">พยายามทั้งหมด</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{attempts.length}</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-sm text-muted-foreground">คำที่ผ่าน</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-emerald-500">
                  {passedCount}
                </p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-sm text-muted-foreground">คะแนนสูงสุด</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{bestScore}</p>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="mb-4 font-semibold">รายละเอียด</h2>
              <div className="space-y-3">
                {attempts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                          a.passed
                            ? "bg-emerald-50 text-emerald-500"
                            : "bg-red-50 text-red-400"
                        }`}
                      >
                        {a.passed ? "✓" : "✗"}
                      </span>
                      <div>
                        <p className="font-medium">{a.word.word}</p>
                        <p className="text-xs text-muted-foreground">
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
            </Card>

            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              กลับไปแดชบอร์ด
            </Button>
          </div>
        ) : lastResult && phase === "scored" ? (
          <div className="space-y-4">
            <Card className="p-8 text-center">
              <p
                className={`text-lg font-semibold ${
                  lastPassed ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {lastPassed ? "✅ ผ่าน!" : "🔄 ลองใหม่"}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-5">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-medium text-muted-foreground">ภาพ</p>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {lastResult.visual_score}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-medium text-muted-foreground">เสียง</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-emerald-500">
                    {lastResult.audio_score}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs font-medium text-muted-foreground">รวม</p>
                  <p className="mt-1 text-xl font-bold tabular-nums">
                    {lastResult.total_score}
                  </p>
                </div>
              </div>
              {lastResult.feedback_th && (
                <p className="mt-5 rounded-lg border border-border bg-muted/50 p-3 text-sm">
                  {lastResult.feedback_th}
                </p>
              )}
            </Card>
            <Button className="w-full" onClick={handleNextWord}>
              คำถัดไป
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleFinish}
            >
              จบเซสชัน
            </Button>
          </div>
        ) : phase === "face-warning" ? (
          <div className="space-y-4">
            <Card className="p-10 text-center">
              <p className="mb-4 text-4xl">😶</p>
              <h2 className="text-lg font-semibold">ไม่พบใบหน้าของคุณ</h2>
              <p className="mt-2 text-muted-foreground">
                กรุณาให้กล้องเห็นใบหน้าของคุณ แล้วกดตรวจสอบอีกครั้ง
              </p>
              <Button
                className="mt-6"
                onClick={() => {
                  if (hasFaceRef.current) {
                    setPhase("practicing")
                  } else {
                    setTimeout(() => {
                      if (hasFaceRef.current) setPhase("practicing")
                    }, 2000)
                  }
                }}
              >
                ตรวจสอบอีกครั้ง
              </Button>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-[240px_1fr_245px] gap-6">
            {/* Left: lesson panel */}
            <Card className="h-fit p-5">
              <h2 className="text-sm font-semibold">บทฝึก</h2>
              {currentWord && (
                <Badge variant="secondary" className="mt-3">
                  {currentWord.viseme_group}
                </Badge>
              )}
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {activeWords.map((w) => {
                  const idx = activeWords.indexOf(w)
                  const done = passedIds.has(w.id)
                  return (
                    <div
                      key={w.id}
                      className={`h-2 rounded-full ${
                        done
                          ? "bg-emerald-500"
                          : w.id === currentWord?.id
                            ? "bg-primary"
                            : "bg-muted"
                      }`}
                    />
                  )
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                คำที่ {currentWord ? activeWords.indexOf(currentWord) + 1 : 0}/
                {activeWords.length}
              </p>
              <div className="mt-4 space-y-1">
                {activeWords.map((w) => (
                  <div
                    key={w.id}
                    className={`rounded-md px-3 py-2 text-sm ${
                      w.id === currentWord?.id
                        ? "bg-muted font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {w.word}
                    <span className="ml-2 text-xs text-amber-500">
                      {"★".repeat(w.difficulty)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Center: word player + camera */}
            <div className="space-y-6">
              {currentWord && (
                <div className="text-center">
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {currentWord.viseme_group}
                  </div>
                  <h1 className="mt-3 text-5xl font-bold tracking-tight">
                    {currentWord.word}
                  </h1>
                  {phase === "ready" && (
                    <p className="mt-3 text-muted-foreground">
                      เตรียมตัวออกเสียงคำนี้
                    </p>
                  )}
                </div>
              )}

              {phase === "ready" && (
                <Button className="w-full" onClick={handleStartPractice}>
                  เริ่มการฝึกออกเสียง
                </Button>
              )}

              {/* Always rendered so videoRef exists for handleStartPractice */}
              <div className={`${phase !== "practicing" ? "hidden" : ""}`}>
                <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg bg-primary">
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
                  <Card className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">กล้อง</h2>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => {
                          faceMesh?.stop()
                          setCameraActive(false)
                          setPhase("ready")
                        }}
                      >
                        หยุดกล้อง
                      </Button>
                    </div>

                    {!hasFace && (
                      <p className="mt-3 text-center text-sm text-amber-500">
                        กรุณาให้ใบหน้าอยู่ในกรอบกล้อง
                      </p>
                    )}
                    <p className="mt-2 text-center text-sm tabular-nums">
                      การเปิดปาก: {mouthOpen}%
                    </p>
                  </Card>

                  <Card className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">เสียงพูด</h2>
                      {!listening ? (
                        <Button size="sm" onClick={handleStartListening}>
                          เริ่มพูด
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={handleStopListening}
                        >
                          หยุดฟัง
                        </Button>
                      )}
                    </div>

                    {listening && (
                      <p className="text-sm text-emerald-500">กำลังฟัง...</p>
                    )}
                    {speechError && (
                      <p className="text-sm text-amber-500">{speechError}</p>
                    )}
                    {transcript && (
                      <div className="mt-3 rounded-lg bg-muted p-4">
                        <p className="text-xs text-muted-foreground">ข้อความที่ได้:</p>
                        <p className="mt-1 text-lg font-medium">{transcript}</p>
                      </div>
                    )}
                  </Card>

                  {phase === "practicing" && (
                    <Button
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={submitting || (!transcript && mouthOpen === 0)}
                    >
                      {submitting ? "กำลังส่ง..." : "ส่งผล"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Tips from Pakky */}
            <Card className="h-fit p-5">
              <div className="mb-3 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">🦊</AvatarFallback>
                </Avatar>
                <p className="text-sm font-semibold">เทคนิคจาก Pakky</p>
              </div>

              {phase === "practicing" ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>ระดับเสียง: {transcript ? "กำลังตรวจสอบ..." : "รอเสียงพูด"}</p>
                  <p>ระดับปาก: {mouthOpen}%</p>
                  <p className="text-xs">รอการประเมิน...</p>
                </div>
              ) : phase === "scored" && lastResult ? (
                <div className="space-y-3 text-sm">
                  <p>ภาพ: {lastResult.visual_score}</p>
                  <p>เสียง: {lastResult.audio_score}</p>
                  <p className={lastPassed ? "text-emerald-500" : "text-amber-500"}>
                    {lastPassed ? "เก่งมาก! ผ่านแล้ว" : "ลองอีกครั้งนะ"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  กดเริ่มการฝึกออกเสียง แล้ว Pakky จะคอยบอกเทคนิคให้ค่ะ~
                </p>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
