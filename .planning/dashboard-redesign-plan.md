# Dashboard Redesign Plan - vispeech

## Design Read
A language-learning dashboard for Thai pronunciation learners. Warm, encouraging, progress-forward. Single indigo accent, Geist font, soft rounded surfaces.

## Dials
| Dial | Value | Why |
|------|-------|-----|
| VARIANCE | 6 | Dashboards need scanability. Predictable grid, personality through hierarchy. |
| MOTION | 4 | Micro-motion on scores and hover. Nothing perpetual. |
| DENSITY | 4 | Glanceable. Not a cockpit. Room to breathe. |

## Audit Summary

### Already Good (no change needed)
- **Typography** - Geist font, `headline`/`title`/`label` utilities, `text-wrap: balance`
- **Color** - Single indigo accent, clean gray neutrals, no warm/cool mixing
- **Surfaces** - `bg-neutral-bg` page, `bg-surface` cards, `shadow-ambient-low` at rest
- **Empty states** - Words list and history both have composed empty states
- **Loading state** - Centered Thai text (per Size Discretion Rule)
- **Error handling** - Inline errors on auth, try/catch on API calls
- **Thai localization** - All UI text is Thai (`th-TH` dates, Thai error messages)
- **Interactive buttons** - Primary buttons have hover lift (`-translate-y-0.5` + `shadow-ambient-high`)

### Needs Improvement
1. **7-column data table** for word accuracy - reads like a spreadsheet, not a learning tool
2. **Flat history list** - same card repeated, no visual rhythm or grouping
3. **No progress visualization** - raw numbers, no bars or visual indicators
4. **Generic description paragraph** at top - manual tone, not a welcome
5. **No active/pressed state** on buttons - missing `active:scale-[0.98]` feedback
6. **No tabular-nums** on score data - numbers shift width as they change
7. **Landing page is a redirect shell** - no real landing content (but this is intentional behavior)

## Layout (top to bottom)

### 1. Header - add user greeting
```
[vispeech]                                    [logout]
สวัสดี, user@email.com     ← new: label text-muted
```
- Remove generic description paragraph
- Greeting uses existing `label` utility

### 2. Stat Cards - 3 columns, micro-visual
Keep 3-column `grid-cols-3` layout. Each card:
- Label + large number (keep existing)
- Add small visual indicator:
  - **Words practiced**: micro-horizontal bar (`h-1.5 bg-primary-light rounded-full`, fill portion `bg-primary`)
  - **Avg score**: mini SVG ring (48px, same technique as practice page `ScoreRing`)
  - **Total attempts**: small streak icon or dot indicator
- Hover: `hover:-translate-y-0.5 hover:shadow-ambient-high`
- Active: `active:scale-[0.98]`

### 3. Word Accuracy Section - CARD GRID (replaces table)
**Current:** 7-column table (word, viseme group, best score, avg score, attempts, last practiced, action)

**New:** 2-column responsive card grid (`grid grid-cols-1 md:grid-cols-2 gap-4`)

Each word card:
```
+---------------------------------------------+
| คำ           กลุ่มรูปปาก           [ฝึก]      |
| สวัสดี       labial               PRIMARY BTN |
|                                              |
| ภาพ ████████████░░░░  80%     ← score bar    |
| เสียง ████████████████  92%    ← score bar    |
|                                              |
| ฝึกแล้ว 3 ครั้ง  ·  ล่าสุด 1 วันที่แล้ว        |
+---------------------------------------------+
```

**Score bar component:**
```tsx
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-sm text-muted">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-primary-light overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${score}%`, backgroundColor: `var(${color})` }} />
      </div>
      <span className="w-8 text-right text-sm font-medium tabular-nums" style={{ color: `var(${color})` }}>{score}</span>
    </div>
  );
}
```

- `tabular-nums` font variant on all numbers to prevent layout shift
- Color coding: `--color-primary` (visual), `--color-accent-green` (audio)
- Bar animation: `transition-all duration-300` for smooth fill updates

**Best score indicator:** Add a small star icon or "best" label next to the highest score

### 4. Practice History - date-grouped timeline
**Current:** flat list of cards sorted by date

**New:** Group by date boundary
```
--- วันนี้ ---
[border-l-2] คำ: สวัสดี    ภาพ 80  เสียง 92  รวม 88    14:30
[border-l-2] คำ: ขอบคุณ   ภาพ 65  เสียง 70  รวม 68    11:15

--- เมื่อวาน ---
[border-l-2] คำ: สบายดี   ภาพ 90  เสียง 85  รวม 88    09:45
```

- Group header: `text-muted headline` with `border-t border-border-subtle pt-4 mt-4`
- Each log card: `border-l-2 border-primary-light pl-4` for visual rhythm
- Scores inline, compact, right-aligned time

**Grouping logic helper:**
```ts
function getDateLabel(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return date.toLocaleDateString("th-TH", { month: "long", day: "numeric" });
}
```

### 5. Info Note - styled as tip card
Restyle the scoring explanation:
- `border-l-2 border-primary` left border
- Small info icon (Phosphor `Info` or `Lightbulb`)
- `bg-primary-light` background
- Feels like a helpful tip, not a footnote

### 6. Interactive Polish (global across dashboard)
Add `active:scale-[0.98]` to all pressable elements:
- Stat cards
- Word cards
- Practice buttons
- Logout button

## Color & Token Usage
All within existing design tokens. No new colors needed.

| Token | Usage |
|-------|-------|
| `bg-primary-light` | Score bar tracks, date-group borders, info note bg |
| `bg-primary` | Score bar fills, "best" labels |
| `bg-accent-green` | Audio score bar fills |
| `text-muted` | Labels, timestamps, metadata, group headers |
| `text-ink` | Word text, section headings |
| `bg-surface` | Cards |
| `bg-neutral-bg` | Page background |
| `shadow-ambient-low` | Cards at rest |
| `shadow-ambient-high` | Card hover lift |
| `border-primary-light` | History accent border |

## Summary of Changes

| Change | Impact |
|--------|--------|
| Replace word table with 2-column card grid | Highest visual impact |
| Add score bars with color coding | Makes progress glanceable |
| Group history by date | Improves scannability |
| Restyle info note as tip card | Polish |
| Add `active:scale` to all buttons | Better tactile feel |
| Add `tabular-nums` to score displays | Prevents layout shift |
| Add greeting, remove description | Cleaner header |
| Stat card micro-visuals | Adds delight |

## Order of Implementation
1. Score bar component + card grid (replaces table)
2. Date-grouped history
3. Header cleanup (greeting, remove description)
4. Info note restyle
5. Interactive polish (active states, tabular-nums)
6. Stat card micro-visuals

## One File Changed
`src/app/dashboard/page.tsx`

## Pre-Flight Check
- Single indigo accent ✓
- Ambient-low on all cards at rest ✓
- Hover lift only on interactive ✓
- No glassmorphism, gradient text ✓
- Mobile: cards 1-column ✓
- No perpetual animations ✓
- Reduced motion: hover-only transitions ✓
- tabular-nums on all score values ✓
