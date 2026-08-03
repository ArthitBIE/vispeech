# Fix Home Page Filter Buttons

## Problem

In `src/app/(app)/home/page.tsx`, the lesson filter buttons ("ทั้งหมด", "กำลังเรียน", "เสร็จแล้ว", "ยังไม่เริ่ม") don't work correctly:

- **Lines 135**: `if (filter === "learning" || filter === "done") list = [];` — empties the lesson list instead of filtering
- **Not-started filter**: No handling at all
- Result: clicking "กำลังเรียน" or "เสร็จแล้ว" shows zero lessons; "ยังไม่เริ่ม" shows all

## Root Cause

The `filteredLessons` memo (lines 133-140) incorrectly clears the list for "learning"/"done" instead of filtering by the already-computed `groupStatus` (lines 142-176).

## Fix

In `filteredLessons` useMemo, replace the broken logic:

```tsx
const filteredLessons = useMemo(() => {
  let list = lessons;
  if (filter === "learning" || filter === "done") list = []; // BUG
  if (search.trim()) {
    list = list.filter((l) => l.name.includes(search.trim()));
  }
  return list;
}, [lessons, filter, search]);
```

With correct filtering using `groupStatus` (already available from `filterCounts` computation):

```tsx
const filteredLessons = useMemo(() => {
  let list = lessons;
  if (filter !== "all") {
    list = list.filter((l) => groupStatus.get(l.id) === filter);
  }
  if (search.trim()) {
    list = list.filter((l) => l.name.includes(search.trim()));
  }
  return list;
}, [lessons, filter, search, groupStatus]);
```

Note: `groupStatus` is a local variable inside `filterCounts` memo. Extract it to a shared `useMemo` so both `filteredLessons` and `filterCounts` can use it without recomputation.

## Files to Change

- `src/app/(app)/home/page.tsx` — extract `groupStatus` to shared memo, fix `filteredLessons`

## Verification

- Click each filter button: "กำลังเรียน" shows only learning lessons, "เสร็จแล้ว" shows only done, "ยังไม่เริ่ม" shows only not-started
- Search + filter combination works
- Filter counts in button labels match displayed lessons
