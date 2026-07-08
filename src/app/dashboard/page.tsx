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

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [accuracy, setAccuracy] = useState<Record<string, WordAccuracy>>({});
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

      const [wordsRes, accuracyRes, logsRes] = await Promise.all([
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
      ]);

      if (wordsRes) setWords(wordsRes);

      const accMap: Record<string, WordAccuracy> = {};
      (accuracyRes.data || []).forEach((a: WordAccuracy) => {
        accMap[a.word_id] = a;
      });
      setAccuracy(accMap);

      if (logsRes.data) setLogs(logsRes.data as PracticeLog[]);
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <h1 className="text-2xl font-bold text-gray-900">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-center text-gray-600">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
          ในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์
        </p>
        <a
          href="/auth"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
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
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">vispeech</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <p className="text-gray-600">
          ระบบนี้ช่วยให้ผู้ใช้เห็นคะแนนความแม่นยำของแต่ละคำ และติดตามพัฒนาการย้อนหลังได้
        </p>

        <section className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">คำที่ฝึกแล้ว</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{totalPracticed}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">คะแนนเฉลี่ย</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">
              {avgScore !== null ? `${avgScore}` : "-"}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">จำนวนครั้งที่ฝึก</p>
            <p className="mt-1 text-3xl font-bold text-indigo-600">{totalAttempts}</p>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">ความแม่นยำแยกตามคำ</h2>
          {words.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีคำศัพท์ในระบบ</p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="px-4 py-3 font-medium">คำ</th>
                    <th className="px-4 py-3 font-medium">กลุ่มรูปปาก</th>
                    <th className="px-4 py-3 font-medium">คะแนนดีที่สุด</th>
                    <th className="px-4 py-3 font-medium">คะแนนเฉลี่ย</th>
                    <th className="px-4 py-3 font-medium">จำนวนครั้ง</th>
                    <th className="px-4 py-3 font-medium">ฝึกล่าสุด</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((w) => {
                    const a = accuracy[w.id];
                    return (
                      <tr key={w.id} data-testid="dashboard-word-card" className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{w.word}</td>
                        <td className="px-4 py-3 text-gray-600">{w.viseme_group}</td>
                        <td className="px-4 py-3 text-gray-900">
                          {a ? `${a.best_score}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {a ? `${Math.round(a.average_score)}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {a ? `${a.total_attempts}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {a ? new Date(a.last_practiced_at).toLocaleDateString("th-TH") : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/practice/${encodeURIComponent(w.word)}`}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
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
          <h2 className="mb-4 text-lg font-semibold text-gray-800">ประวัติการฝึก</h2>
          {logs.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">ยังไม่มีประวัติการฝึก เริ่มฝึกคำแรกของคุณเลย!</p>
              {words.length > 0 && (
                <a
                  href={`/practice/${encodeURIComponent(words[0].word)}`}
                  className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
                >
                  เริ่มฝึก
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {log.words?.word || "ไม่พบคำ"}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString("th-TH")}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>ภาพ: {log.visual_score}</span>
                      <span>เสียง: {log.audio_score}</span>
                      <span className="font-semibold text-indigo-600">
                        รวม: {log.total_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className="rounded-lg bg-indigo-50 p-4 text-sm text-gray-600">
          สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก
        </p>
      </main>
    </div>
  );
}
