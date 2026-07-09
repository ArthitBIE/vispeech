"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <h1 className="text-2xl font-bold text-slate-800">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-center text-slate-500">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
          ในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์
        </p>
        <a
          href="/auth"
          className="rounded-lg bg-indigo-500 px-6 py-2 text-white shadow-sm hover:bg-indigo-600 transition-colors"
        >
          ไปหน้าเข้าสู่ระบบ
        </a>
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">vispeech</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/practice/session")}
              className="rounded-lg bg-indigo-500 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 transition-colors"
            >
              เริ่มฝึก
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <p className="max-w-2xl leading-relaxed text-slate-500">
          ระบบนี้ช่วยให้ผู้ใช้เห็นคะแนนความแม่นยำของแต่ละคำ และติดตามพัฒนาการย้อนหลังได้
        </p>

        <section className="grid grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">คำที่ฝึกแล้ว</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-indigo-500">{totalPracticed}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">คะแนนเฉลี่ย</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-500">
              {avgScore !== null ? `${avgScore}` : "-"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-400">จำนวนครั้งที่ฝึก</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-indigo-500">{totalAttempts}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-700">ความแม่นยำแยกตามคำ</h2>
          {words.length === 0 ? (
            <p className="text-slate-400">ยังไม่มีคำศัพท์ในระบบ</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <th className="px-5 py-3.5 font-medium">คำ</th>
                    <th className="px-5 py-3.5 font-medium">กลุ่มรูปปาก</th>
                    <th className="px-5 py-3.5 font-medium">คะแนนดีที่สุด</th>
                    <th className="px-5 py-3.5 font-medium">คะแนนเฉลี่ย</th>
                    <th className="px-5 py-3.5 font-medium">จำนวนครั้ง</th>
                    <th className="px-5 py-3.5 font-medium">ฝึกล่าสุด</th>
                    <th className="px-5 py-3.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((w) => {
                    const a = accuracy[w.id];
                    return (
                      <tr key={w.id} data-testid="dashboard-word-card" className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-800">{w.word}</td>
                        <td className="px-5 py-4 text-slate-500">{w.viseme_group}</td>
                        <td className="px-5 py-4 tabular-nums text-slate-700">
                          {a ? `${a.best_score}` : "-"}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-700">
                          {a ? `${Math.round(a.average_score)}` : "-"}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-700">
                          {a ? `${a.total_attempts}` : "-"}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {a ? new Date(a.last_practiced_at).toLocaleDateString("th-TH") : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <a
                            href={`/practice/${encodeURIComponent(w.word)}`}
                            className="inline-block rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
                          >
                            ฝึก
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-700">ประวัติเซสชัน</h2>
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="text-slate-400">ยังไม่มีประวัติเซสชัน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">
                        {new Date(s.created_at).toLocaleDateString("th-TH")} —{" "}
                        {new Date(s.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p className="text-xs text-slate-400">
                        ผ่าน {s.passed_count}/{s.total_attempts} คำ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-500 tabular-nums">{s.best_score}</p>
                      <p className="text-xs text-slate-400">คะแนนสูงสุด</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 text-lg font-semibold text-slate-700">ประวัติการฝึก</h2>
          {logs.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-white p-10 text-center shadow-sm">
              <p className="text-slate-400">ยังไม่มีประวัติการฝึก เริ่มฝึกคำแรกของคุณเลย!</p>
              {words.length > 0 && (
                <a
                  href={`/practice/${encodeURIComponent(words[0].word)}`}
                  className="mt-4 inline-block rounded-lg bg-indigo-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600 transition-colors"
                >
                  เริ่มฝึก
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-medium text-indigo-600">
                        {log.words?.word?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {log.words?.word || "ไม่พบคำ"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(log.created_at).toLocaleString("th-TH")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 text-sm">
                      <span className="text-slate-400">ภาพ <strong className="text-slate-700 tabular-nums">{log.visual_score}</strong></span>
                      <span className="text-slate-400">เสียง <strong className="text-slate-700 tabular-nums">{log.audio_score}</strong></span>
                      <span className="font-semibold text-emerald-500 tabular-nums">
                        รวม {log.total_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm leading-relaxed text-slate-500">
          สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก
        </p>
      </main>
    </div>
  );
}
