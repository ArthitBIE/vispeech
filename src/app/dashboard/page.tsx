"use client";

import { Component, useEffect, useState, useMemo, useRef } from "react";
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

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const tooltip = label === "ภาพ" ? "คะแนนภาพ: วิเคราะห์รูปปากจากกล้อง" : label === "เสียง" ? "คะแนนเสียง: วิเคราะห์เสียงพูด" : undefined;
  return (
    <div className="flex items-center gap-2" title={tooltip}>
      <span className="w-8 shrink-0 text-sm text-muted">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-bg">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: `var(${color})` }}
        />
      </div>
      <span className="w-7 text-right text-sm font-medium tabular-nums" style={{ color: `var(${color})` }}>
        {score}
      </span>
    </div>
  );
}

function getEncouragement(practiced: number, total: number, avg: number | null): string | null {
  if (practiced === 0) return null;
  const progress = total > 0 ? Math.round((practiced / total) * 100) : 0;
  if (progress >= 100) {
    if (avg !== null && avg >= 80) return "ฝึกครบทุกคำแล้ว ผลงานยอดเยี่ยม! ภูมิใจในตัวคุณ";
    return "ฝึกครบทุกคำแล้ว! ยอดเยี่ยม!";
  }
  if (avg !== null && avg >= 90) return "คะแนนยอดเยี่ยมมาก! คุณทำได้ดีขึ้นเรื่อยๆ";
  if (avg !== null && avg >= 80) return "ทำได้ดีมาก! พัฒนาขึ้นเรื่อยๆ เลย";
  if (practiced >= 15) return `ฝึกไปแล้ว ${practiced} คำ! ความพยายามไม่เคยทรยศ`;
  if (practiced >= 8) return `ฝึกไปแล้ว ${practiced} คำ! ทำได้ดีมาก`;
  if (practiced >= 3) return `ฝึกไปแล้ว ${practiced} คำ! เริ่มชินแล้วสิ`;
  return "เริ่มต้นได้ดี! ลองฝึกคำต่อไป";
}

function getDateLabel(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { month: "long", day: "numeric" });
}

const cardHover = "rounded-lg bg-surface p-6 shadow-ambient-low transition-all hover:-translate-y-0.5 hover:shadow-ambient-high active:scale-[0.98]";
const btnPrimary = "rounded-md bg-primary px-6 py-2 text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high active:scale-[0.98]";

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-bg px-4">
          <p className="text-muted">เกิดข้อผิดพลาด กรุณาลองอีกครั้ง</p>
          <button onClick={() => window.location.reload()} className={btnPrimary}>
            รีเฟรชหน้า
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [accuracy, setAccuracy] = useState<Record<string, WordAccuracy>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "score-asc" | "score-desc" | "difficulty" | "recent">("default");
  const [calloutDismissed, setCalloutDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dashboard_callout_dismissed") === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (!window.confirm("คุณต้องการออกจากระบบ?")) return;
    await supabase?.auth?.signOut();
    router.push("/auth");
  }

  const totalPracticed = Object.keys(accuracy).length;
  const avgScore = totalPracticed > 0
    ? Math.round(Object.values(accuracy).reduce((s, a) => s + a.average_score, 0) / totalPracticed)
    : null;
  const totalAttempts = Object.values(accuracy).reduce((s, a) => s + a.total_attempts, 0);
  const displayName = session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "";
  const encouragement = getEncouragement(totalPracticed, words.length, avgScore);

  const groupedLogs = useMemo(() => {
    const groups: Record<string, PracticeLog[]> = {};
    for (const log of logs) {
      const label = getDateLabel(log.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(log);
    }
    return Object.entries(groups);
  }, [logs]);

  const visemeGroups = useMemo(() => {
    const groups = new Set(words.map((w) => w.viseme_group));
    return ["all", "unpracticed", ...Array.from(groups).sort()];
  }, [words]);

  const filteredWords = useMemo(() => {
    let result: Word[];
    if (activeFilter === "all") result = words;
    else if (activeFilter === "unpracticed") result = words.filter((w) => !accuracy[w.id]);
    else result = words.filter((w) => w.viseme_group === activeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w) => w.word.toLowerCase().includes(q));
    }
    if (sortBy === "score-asc")
      result = [...result].sort((a, b) => (accuracy[a.id]?.average_score ?? 0) - (accuracy[b.id]?.average_score ?? 0));
    else if (sortBy === "score-desc")
      result = [...result].sort((a, b) => (accuracy[b.id]?.average_score ?? 0) - (accuracy[a.id]?.average_score ?? 0));
    else if (sortBy === "difficulty")
      result = [...result].sort((a, b) => a.difficulty - b.difficulty);
    else if (sortBy === "recent")
      result = [...result].sort((a, b) => new Date(accuracy[b.id]?.last_practiced_at ?? 0).getTime() - new Date(accuracy[a.id]?.last_practiced_at ?? 0).getTime());
    return result;
  }, [words, accuracy, activeFilter, sortBy, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / pageSize));
  const displayedWords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWords.slice(start, start + pageSize);
  }, [filteredWords, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "/") { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === "j" && currentPage < totalPages) setCurrentPage((p) => p + 1);
      if (e.key === "k" && currentPage > 1) setCurrentPage((p) => p - 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages]);

  const filterLabels: Record<string, string> = {
    all: "ทั้งหมด",
    unpracticed: "ยังไม่ได้ฝึก",
  };
  function getFilterLabel(v: string) {
    return filterLabels[v] || v;
  }
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-bg px-4">
        <h1 className="text-2xl font-bold text-ink">ยังไม่ได้ตั้งค่า Supabase</h1>
        <p className="max-w-md text-center text-muted">
          กรุณาเพิ่ม NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY
          ในไฟล์ .env.local แล้วรีสตาร์ทเซิร์ฟเวอร์
        </p>
        <a
          href="/auth"
          className={btnPrimary}
        >
          ไปหน้าเข้าสู่ระบบ
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <header className="border-b border-border-subtle bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-bg" />
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-bg" />
            </div>
            <div className="h-8 w-20 animate-pulse rounded bg-neutral-bg" />
          </div>
        </header>
        <main className="mx-auto max-w-5xl animate-pulse px-4 py-8">
          <div className="mb-6 grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="rounded-lg bg-surface p-6 shadow-ambient-low">
                <div className="mb-2 h-4 w-16 rounded bg-neutral-bg" />
                <div className="mb-2 h-8 w-12 rounded bg-neutral-bg" />
                <div className="h-1.5 rounded-full bg-neutral-bg" />
              </div>
            ))}
          </div>
          <div className="mb-4 flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 w-16 rounded-full bg-neutral-bg" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-lg bg-surface p-6 shadow-ambient-low">
                <div className="mb-3 h-6 w-20 rounded bg-neutral-bg" />
                <div className="mb-2 h-4 w-12 rounded bg-neutral-bg" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-neutral-bg" />
                  <div className="h-3 w-full rounded bg-neutral-bg" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-bg px-4">
        <p className="text-muted">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); loadData(); }}
          className={btnPrimary}
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-neutral-bg">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="title text-ink">vispeech</h1>
            {session && (
              <p className="label mt-0.5 text-muted">สวัสดีคุณ{displayName}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md px-4 py-2 text-sm text-muted transition-colors hover:bg-neutral-bg"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">

        {/* Stats section */}
        {totalPracticed === 0 ? (
          <section className="mb-6 rounded-lg bg-surface p-4 shadow-ambient-low">
            <p className="text-sm text-muted">ยังไม่ได้ฝึกเลย — เลือกคำศัพท์ด้านล่างแล้วคลิก "ฝึก" เพื่อเริ่ม!</p>
          </section>
        ) : (
        <section className="mb-6 grid grid-cols-3 gap-4">

          <div className={cardHover}>
            <p className="label text-muted">คำที่ฝึกแล้ว</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{totalPracticed}</p>
            {words.length > 0 && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-light">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, (totalPracticed / words.length) * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className={cardHover}>
            <p className="label text-muted">คะแนนเฉลี่ย</p>
            {avgScore !== null ? (
              <div>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">{avgScore}</p>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, var(${avgScore >= 80 ? "--color-accent-green" : avgScore >= 60 ? "--color-accent-amber" : "--color-primary"}) 25%, transparent)` }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${avgScore}%`,
                      backgroundColor: `var(${avgScore >= 80 ? "--color-accent-green" : avgScore >= 60 ? "--color-accent-amber" : "--color-primary"})`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-1 text-3xl font-bold tabular-nums text-muted">-</p>
            )}
          </div>

          <div className={cardHover}>
            <p className="label text-muted">จำนวนครั้งที่ฝึก</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-muted">{totalAttempts}</p>
            {totalAttempts === 0 && (
              <p className="mt-2 text-xs text-muted">เริ่มฝึกคำแรกของคุณ!</p>
            )}
          </div>
        </section>
        )}

        {encouragement && (
          <p className="mb-6 text-sm text-muted italic">{encouragement}</p>
        )}

        {totalPracticed === 0 && (
          <div className="mb-6 rounded-lg border-l-2 border-primary bg-surface p-6 shadow-ambient-low">
            <h3 className="headline mb-2 text-ink">ยินดีต้อนรับคุณ{displayName}</h3>
            <p className="text-sm text-muted">
              เลือกคำศัพท์ด้านล่างแล้วคลิก "ฝึก" เพื่อเริ่มออกเสียง
              ระบบจะวิเคราะห์ทั้งภาพจากกล้องและเสียงของคุณ เพื่อช่วยให้คุณออกเสียงได้ถูกต้องยิ่งขึ้น
            </p>
          </div>
        )}

        {/* Info callout — shown after first practice to avoid stacking with welcome */}
        {totalPracticed > 0 && !calloutDismissed && (
        <div className="mb-8 rounded-lg border-l-2 border-primary bg-primary-light p-4">
          <div className="flex items-start gap-3">
            <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p className="flex-1 text-sm text-ink">
               สำหรับวรรณยุกต์ ระบบให้ความสำคัญกับเสียงพูด ส่วนพยัญชนะและรูปปากใช้การวิเคราะห์ภาพเป็นหลัก
            </p>
            <button
              onClick={() => {
                setCalloutDismissed(true);
                localStorage.setItem("dashboard_callout_dismissed", "true");
              }}
              className="shrink-0 rounded p-1 text-muted hover:bg-primary/10 hover:text-ink"
              aria-label="ปิด"
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
        )}

        {/* Word accuracy section with filtering */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="headline text-ink">ความแม่นยำแยกตามคำ</h2>
            <div className="group relative">
              <svg aria-hidden="true" className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-64 rounded-lg bg-surface p-2 text-xs text-ink shadow-ambient-high opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10" role="tooltip">
                คำศัพท์จัดกลุ่มตามลักษณะรูปปากที่ใกล้เคียงกัน ฝึกรวมกันเพื่อเปรียบเทียบรูปปากและเสียงของคุณ
              </div>
            </div>
          </div>

          {words.length === 0 ? (
            <p className="text-muted">ยังไม่มีคำศัพท์ในระบบ</p>
          ) : (
            <>
              {/* Filter tabs — by practice status and viseme group */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="กรองตามหมวดหมู่">
                  {(showAllFilters ? visemeGroups : visemeGroups.slice(0, 6)).map((group, idx) => (
                    <button
                      key={group}
                      role="tab"
                      aria-selected={activeFilter === group}
                      onClick={() => setActiveFilter(group)}
                      onKeyDown={(e) => {
                        const pills = Array.from((e.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? []) as NodeListOf<HTMLElement>);
                        let next = idx;
                        if (e.key === "ArrowRight") next = (idx + 1) % pills.length;
                        else if (e.key === "ArrowLeft") next = (idx - 1 + pills.length) % pills.length;
                        else return;
                        e.preventDefault();
                        pills[next]?.focus();
                      }}
                      className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
                        activeFilter === group
                          ? "bg-primary text-surface"
                          : "bg-neutral-bg text-muted hover:bg-primary-light hover:text-primary"
                      }`}
                    >
                      {getFilterLabel(group)}
                      <span className="ml-1.5 text-xs opacity-60">
                        {group === "all"
                          ? words.length
                          : group === "unpracticed"
                            ? words.filter((w) => !accuracy[w.id]).length
                            : words.filter((w) => w.viseme_group === group).length}
                      </span>
                    </button>
                  ))}
                  {visemeGroups.length > 6 && (
                    <button
                      onClick={() => setShowAllFilters((v) => !v)}
                      className="rounded-full px-3 py-1 text-sm font-medium text-muted transition-all hover:bg-primary-light hover:text-primary"
                    >
                      {showAllFilters ? "แสดงน้อยลง" : `อื่นๆ +${visemeGroups.length - 6}`}
                    </button>
                  )}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-sm text-ink"
                >
                  <option value="default">เรียงตามค่าเริ่มต้น</option>
                  <option value="score-asc">คะแนนน้อย→มาก</option>
                  <option value="score-desc">คะแนนมาก→น้อย</option>
                  <option value="difficulty">ความยาก</option>
                  <option value="recent">ล่าสุด</option>
                </select>
              </div>

              {/* Search and page size controls */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="ค้นหาคำศัพท์ (กด /)"
                    aria-label="ค้นหาคำศัพท์"
                    className="w-full rounded-md border border-border-default bg-surface px-3 py-1.5 pl-8 text-sm text-ink placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                  <svg aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-md border border-border-default bg-surface px-3 py-1.5 text-sm text-ink"
                  aria-label="จำนวนรายการต่อหน้า"
                >
                  <option value={10}>10 ต่อหน้า</option>
                  <option value={20}>20 ต่อหน้า</option>
                  <option value={50}>50 ต่อหน้า</option>
                </select>
              </div>

              {/* Word cards or empty filter state */}
              {displayedWords.length === 0 ? (
                <p className="text-sm text-muted">
                  {activeFilter === "unpracticed" ? "ฝึกคำศัพท์ทั้งหมดแล้ว!" : "ไม่มีคำศัพท์ในกลุ่มนี้"}
                </p>
              ) : (
                <>
                  <div key={`${activeFilter}-${sortBy}-${searchQuery}-${currentPage}`} className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="dashboard-word-card">
                    {displayedWords.map((w) => {
                      const a = accuracy[w.id];
                      return (
                        <div key={w.id} className={cardHover}>
                          <div className="mb-3 flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="title break-words text-ink">{w.word}</p>
                              <span className="mt-1 inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                                {w.viseme_group}
                              </span>
                            </div>
                            <a
                              href={`/practice/${encodeURIComponent(w.word)}`}
                              className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs text-surface transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-ambient-high active:scale-[0.98]"
                            >
                              ฝึก
                            </a>
                          </div>

                          {a ? (
                            <>
                              <ScoreBar label="คะแนนรวม" score={a.best_score} color="--color-primary" />
                              <div className="mt-3 text-xs tabular-nums text-muted">
                                ฝึกแล้ว {a.total_attempts} ครั้ง · ล่าสุด {new Date(a.last_practiced_at).toLocaleDateString("th-TH")}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-muted">ยังไม่ได้ฝึกคำนี้</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-md px-4 py-2 text-sm text-muted transition-colors hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ← ก่อนหน้า
                      </button>
                      <span className="text-sm tabular-nums text-muted">
                        {currentPage} / {totalPages}
                      </span>
                      <span className="hidden text-xs text-muted sm:inline">j/k</span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-md px-4 py-2 text-sm text-muted transition-colors hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ถัดไป →
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/* History section */}
        <section>
          <h2 className="headline mb-4 text-ink">ประวัติการฝึก</h2>
          {logs.length === 0 ? (
            <div className="rounded-lg bg-surface p-6 text-center shadow-ambient-low">
              <p className="text-muted">ยังไม่มีประวัติการฝึก เริ่มฝึกคำแรกของคุณเลย!</p>
              {words.length > 0 && (
                <a
                  href={`/practice/${encodeURIComponent(words[0].word)}`}
                  className={btnPrimary}
                >
                  เริ่มฝึก
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedLogs.map(([label, groupLogs]) => (
                <div key={label}>
                  <h3 className="headline mb-3 text-muted">{label}</h3>
                  <div className="space-y-2">
                    {groupLogs.map((log) => (
                      <div
                        key={log.id}
                        className={cardHover}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-8 w-1 shrink-0 rounded-full bg-primary-light" />
                            <div className="min-w-0">
                              <span className="font-medium text-ink tabular-nums">
                                {log.words?.word || "ไม่พบคำ"}
                              </span>
                              <p className="mt-0.5 text-xs text-muted">
                                {new Date(log.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm tabular-nums shrink-0">
                            <span>ภาพ {log.visual_score}</span>
                            <span className="text-accent-green">เสียง {log.audio_score}</span>
                            <span className="font-semibold text-primary">รวม {log.total_score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
    </ErrorBoundary>
  );
}
