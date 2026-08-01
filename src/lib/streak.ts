// Streak computation from practice dates (UTC timestamps from supabase).
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface StreakInfo {
  streak: number;
  startDate: Date | null;
}

// Counts consecutive practiced days ending today (or yesterday, so an
// un-practiced today does not reset the streak).
export function computeStreak(
  practiceDateKeys: string[],
  today = new Date()
): StreakInfo {
  const practiced = new Set(practiceDateKeys);
  const cursor = new Date(today);
  if (!practiced.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  const start = new Date(cursor);
  let streak = 0;
  while (practiced.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, startDate: streak > 0 ? start : null };
}

// The n calendar days ending at `end` (oldest first).
export function lastNDays(n: number, end = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export function thaiWeekdayShort(d: Date): string {
  return new Intl.DateTimeFormat("th-TH", { weekday: "short" }).format(d);
}

export function thaiFullDate(d: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}
