"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Word {
  id: string;
  word: string;
  viseme_group: string;
  difficulty: number;
}

interface PracticeLog {
  id: string;
  word_id: string;
  visual_score: number;
  audio_score: number;
  total_score: number;
  created_at: string;
  words: { word: string } | null;
}

interface WordAccuracy {
  word_id: string;
  best_score: number;
  average_score: number;
  total_attempts: number;
  last_practiced_at: string;
}

interface PracticeSession {
  id: string;
  total_attempts: number;
  passed_count: number;
  best_score: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [accuracy, setAccuracy] = useState<Record<string, WordAccuracy>>({});
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (!isSupabaseConfigured || !supabase?.auth) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }
      setSession(session);

      const [wordsRes, accuracyRes, logsRes, sessionsRes] = await Promise.all([
        (async () => {
          try {
            const headers: Record<string, string> = {};
            if (session?.access_token) {
              headers["Authorization"] = `Bearer ${session.access_token}`;
            }
            const res = await fetch("/api/words", { headers });
            if (res.status === 401) {
              console.warn("API words: unauthorized, using empty list");
              return [];
            }
            if (!res.ok) throw new Error(`API returned ${res.status}`);
            const { words } = await res.json();
            return words.map((w: any) => ({
              id: w.id,
              word: w.text,
              viseme_group: w.visemeGroup,
              difficulty: w.difficulty,
            }));
          } catch (e) {
            console.warn("Failed to fetch words via API:", e);
            return null;
          }
        })(),
        supabase.from("word_accuracy").select("*").eq("user_id", session.user.id),
        supabase
          .from("practice_logs")
          .select("*, words(word)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("practice_sessions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (wordsRes) setWords(wordsRes);

      const accMap: Record<string, WordAccuracy> = {};
      (accuracyRes.data || []).forEach((a: WordAccuracy) => {
        accMap[a.word_id] = a;
      });
      setAccuracy(accMap);

      if (logsRes.data) setLogs(logsRes.data as PracticeLog[]);
      if (sessionsRes.data) setSessions(sessionsRes.data as PracticeSession[]);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase?.auth?.signOut();
    router.push("/auth");
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted px-4 text-center">
        <h1 className="text-2xl font-bold">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-muted-foreground">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
          ในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์
        </p>
        <Button asChild>
          <a href="/auth">ไปหน้าเข้าสู่ระบบ</a>
        </Button>
      </div>
    );
  }

  const totalPracticed = Object.keys(accuracy).length;
  const avgScore = totalPracticed > 0
    ? Math.round(Object.values(accuracy).reduce((s, a) => s + a.average_score, 0) / totalPracticed)
    : null;
  const totalAttempts = Object.values(accuracy).reduce((s, a) => s + a.total_attempts, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} variant="elevated" className="h-28 animate-pulse" />
          ))}
        </div>
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <Card variant="surface" className="h-96 animate-pulse" />
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("th-TH", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <p className="max-w-2xl leading-relaxed text-muted-foreground">
        ระบบนี้ช่วยให้ผู้ใช้เห็นคะแนนความแม่นยำของแต่ละคำ และติดตามพัฒนาการย้อนหลังไดด้
      </p>

      {/* Stats - Asymmetric 3-card layout */}
      <section className="grid gap-5 sm:grid-cols-3">
        <Card variant="elevated" className="sm:col-span-2">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">คำที่ฝึกแล้ว</p>
            <p className="mt-2 text-4xl font-bold tabular-nums">{totalPracticed}</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full bg-brand transition-all duration-500"
                style={{ width: `${Math.min(100, (totalPracticed / 50) * 100)}%` }}
              />
            </div>
          </div>
        </Card>
        <Card variant="surface">
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">คะแนนเฉลี่ย</p>
            <p className="mt-2 text-4xl font-bold tabular-nums">
              {avgScore !== null ? `${avgScore}` : "-"}
            </p>
          </div>
        </Card>
      </section>

      {/* Word accuracy table */}
      <section>
        <h2 className="mb-5 text-lg font-semibold">ความแม่นยำแยกตามคำ</h2>
        {words.length === 0 ? (
          <Card variant="ghost" className="py-16 text-center">
            <p className="text-muted-foreground">ยังไม่มีคำศัพท์ในระบบ</p>
          </Card>
        ) : (
          <Card variant="elevated" className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>คำ</TableHead>
                  <TableHead>กลุ่มรูปปาก</TableHead>
                  <TableHead>คะแนนดีที่สุด</TableHead>
                  <TableHead>คะแนนเฉลี่ย</TableHead>
                  <TableHead>จำนวนครั้ง</TableHead>
                  <TableHead>ฝึกล่าสุด</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((w) => {
                  const a = accuracy[w.id];
                  return (
                    <TableRow key={w.id} data-testid="dashboard-word-card">
                      <TableCell className="font-medium">{w.word}</TableCell>
                      <TableCell className="text-muted-foreground">{w.viseme_group}</TableCell>
                      <TableCell className="tabular-nums">{a ? `${a.best_score}` : "-"}</TableCell>
                      <TableCell className="tabular-nums">{a ? `${Math.round(a.average_score)}` : "-"}</TableCell>
                      <TableCell className="tabular-nums">{a ? `${a.total_attempts}` : "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {a ? formatDateTime(a.last_practiced_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="secondary" size="sm">
                          <a href={`/practice/${encodeURIComponent(w.word)}`}>ฝึก</a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>

      {/* Session History */}
      <section>
        <h2 className="mb-5 text-lg font-semibold">ประวัติเซสชัน</h2>
        {sessions.length === 0 ? (
          <Card variant="ghost" className="py-16 text-center">
            <p className="text-muted-foreground">ยังไม่มีประวัติเซสชัน</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map((s) => (
              <Card key={s.id} variant="bordered" interactive>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-medium">{formatDateTime(s.created_at)}</p>
                    <p className="text-xs text-muted-foreground">
                      ผ่าน {s.passed_count}/{s.total_attempts} คำ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-brand">{s.best_score}</p>
                    <p className="text-xs text-muted-foreground">คะแนนสูงสุด</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Practice Log */}
      <section>
        <h2 className="mb-5 text-lg font-semibold">ประวัติการฝึก</h2>
        {logs.length === 0 ? (
          <Card variant="ghost" className="py-16 text-center">
            <p className="text-muted-foreground">ยังไม่มีประวัติการฝึก เริ่มฝึกคำแรกของคุณเลย!</p>
            {words.length > 0 && (
              <Button asChild className="mt-6">
                <a href={`/practice/${encodeURIComponent(words[0].word)}`}>เริ่มฝึก</a>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} variant="bordered" interactive>
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-sm font-medium text-brand">
                      {log.words?.word?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{log.words?.word || "ไม่พบคำ"}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      ภาพ <strong className="tabular-nums">{log.visual_score}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      เสียง <strong className="tabular-nums">{log.audio_score}</strong>
                    </span>
                    <Badge variant={log.total_score >= 70 ? "default" : "secondary"} className="font-semibold">
                      รวม {log.total_score}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Info box with texture */}
      <Card variant="ghost" className="noise-bg border border-border">
        <p className="p-5 text-sm leading-relaxed text-muted-foreground">
          สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก
        </p>
      </Card>
    </div>
  );
}