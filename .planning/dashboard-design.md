# Dashboard Design Plan - vispeech

**Design Read:** A language-learning dashboard for Thai pronunciation learners. Warm, encouraging, progress-focused. Not B2B analytics - personal and glanceable.

## Dials

| Dial | Value | Why |
|------|-------|-----|
| VARIANCE | 6 | Dashboards need scanability. Predictable grid, personality through visual hierarchy. |
| MOTION | 4 | Micro-motion on scores and hover. Nothing perpetual. |
| DENSITY | 4 | Glanceable data. Not a cockpit. Room to breathe. |

## The Problem

The current dashboard works functionally but feels generic:

1. **Table-based word list** - reads like a spreadsheet, 7 columns overwhelm
2. **Flat history list** - same card repeated with no rhythm
3. **No progress visualization** - raw numbers, no bars or rings
4. **Generic description text** - user manual tone, not a welcome
5. **No section identity** - stats/words/history float uniformly

## Layout (top to bottom)

### 1. Header - smaller, personal
- `vispeech` left, logout right (keep structure)
- Add greeting: `text-muted label` with user email
- Remove the generic description paragraph

### 2. Stats Strip - 3 cards with micro-visuals
- **Words practiced** - small horizontal bar (indigo fill vs total available)
- **Average score** - mini SVG ring (48px, same technique as practice page, tinted by range: green >80, amber 60-80, indigo <60)
- **Total attempts** - number with streak icon. At 0, show gentle prompt

### 3. Word Accuracy - Card Grid (replaces table)
Biggest change. 2-column grid (desktop), 1-column (mobile).

Each card:
```
+----------------------------------+
| {word}               {viseme}    |  title-weight word, pill badge
|                                  |
| Visual score bar (indigo)   85   |  bg-primary-light track, bg-primary fill
| Audio score bar (green)     70   |  bg-primary-light track, bg-accent-green fill
|                                  |
| 4 attempts  :  last 2 days ago   |  muted metadata
|                    [  ]          |  primary button, right-aligned
+----------------------------------+
```

### 4. Practice History - grouped timeline
- Group by date ("Today", "Yesterday", "3 days ago", or th-TH date)
- Each group header: `headline` in `text-muted`
- Each entry: current card style + `border-l-2 border-primary-light` for rhythm
- Word prominent left, scores inline compact, time right

### 5. Info Note - styled as tip card
Keep scoring explanation. Restyle:
- `border-l-2 border-primary` left border
- Small info icon before text
- Reads as helpful tip, not footnote

## Color & Token Usage

| Token | Where |
|-------|-------|
| `bg-primary-light` | Score bar tracks, date-group borders |
| `bg-primary` | Score bar fills |
| `bg-accent-green` / `bg-accent-amber` | Audio score fill by range |
| `text-primary` | Score values |
| `text-muted` | Labels, timestamps, metadata |
| `text-ink` | Word text, headings |
| `bg-surface` | Cards |
| `bg-neutral-bg` | Page background |

No new tokens needed. Everything exists in the design system.

## Component Changes

| Component | Change |
|-----------|--------|
| Stat cards | Add micro-SVG progress ring + icon |
| Word table | REMOVED. Replaced by card grid |
| Word cards | NEW component pattern |
| History list | Date-grouped + left accent border |
| Info note | Restyled as tip card |
| Header | Add greeting, remove description |

## One File Changed

Only `src/app/dashboard/page.tsx`.

## Not Changing

- Auth flow
- Practice page
- Design tokens / globals.css
- API / data fetching
- Empty states (minor polish only)

## Quick Visual

```
[vispeech]                                        [logout]
สวัสดี, user@email.com

+-----------+  +-----------+  +-----------+
| Words     |  | Avg Score |  | Attempts  |
| practiced |  |   80%     |  |    42     |
| [==== 5]  |  | [ring]    |  | [icon]    |
+-----------+  +-----------+  +-----------+

Word Accuracy
+------------------+  +------------------+
| สวัสดี   [labial] |  | ขอบคุณ   [dental] |
| vision ████░ 80   |  | vision ██░░░ 45   |
| audio  █████ 92   |  | audio  ████░ 78   |
| 3x : last 1d ago  |  | 1x : last 5d ago  |
|           [ฝึก]    |  |           [ฝึก]    |
+------------------+  +------------------+

Practice History
--- Today ---
[border-l-2] ขอบคุณ  vision 80 audio 92 total 88  14:30
[border-l-2] สวัสดี   vision 65 audio 70 total 68  11:15

--- Yesterday ---
[...]

i Tip: Voice scoring uses audio for tones, visual for mouth shapes.
```
