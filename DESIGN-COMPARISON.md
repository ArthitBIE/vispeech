# Design Mockup vs Current UI Comparison

**Source of truth:** `design-example/` TSX mockups (8 screens) + `DESIGN.md` (conflicting indigo spec)
**Current implementation:** 17 mapped files under `src/` (Next.js 16, Tailwind 4, Radix UI)

---

## Executive Summary

| Aspect                | Mockup Target                | Current Reality                      | Gap          |
| --------------------- | ---------------------------- | ------------------------------------ | ------------ |
| **Primary color**     | Pure black `#000`            | Near-black `#171717` (`--primary`)   | ✅ Close     |
| **Borders**           | `neutral-200`                | `--border #e6e6e6` (≈neutral-200)    | ✅ Close     |
| **Card elevation**    | `shadow-none`, `rounded-2xl` | `shadow-none`, `rounded-2xl`         | ✅ Match     |
| **Dark mode**         | Not designed                 | Tokens exist, **broken in practice** | ❌ Major     |
| **Typography**        | `font-sans`                  | IBM Plex Sans Thai (variable)        | ⚠️ Different |
| **Icon set**          | Lucide + emoji               | Lucide + emoji (💡🎤👄)              | ✅ Match     |
| **Thai localization** | Full                         | App pages only (Settings = English)  | ⚠️ Partial   |

---

## Page-by-Page Comparison

### 1. Global Layout (AppShell / Header / Sidebar)

| Mockup                                                                                                                   | Current                                                                                                                  | Delta                                                        |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Header `h-14`, white, `border-b neutral-200`, logo (rotated black square + V) + 1px divider + "Vispeech" + avatar circle | Header `h-14`, sticky, `border-b border-border`, `TitleLogo` (SVG) + avatar dropdown (email initial)                     | Missing: divider, "Vispeech" text, logo style differs        |
| Sidebar `w-60` (240px), 3 nav items (Thai labels), active = `bg-neutral-100 font-semibold`                               | Sidebar `w-[266px]`, same 3 items, active = `bg-muted font-semibold text-foreground`                                     | Width +26px, active uses themed `bg-muted` not `neutral-100` |
| Streak card: orange border, flame icon, 5-day flame grid, 10-day goal progress bar                                       | Streak card: `border-orange-300`, flame `fill-orange-500`, 5-day calendar grid (tiny dots), progress bar `bg-orange-400` | Grid style differs (flame vs dots), progress bar matches     |
| Bottom: promo banner "แพ็กที่รออยู่นะ~" + big mascot circle                                                              | Promo banner `border border-border` + empty `bg-muted` circle                                                            | Matches (placeholder)                                        |

### 2. Home (`/home`)

| Mockup                                                                                                                                                                                               | Current                                                                                                                                                                                                                                                           | Delta                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Inner container `rounded-xl border bg-white p-6 max-w-6xl`                                                                                                                                           | `mx-auto max-w-6xl` wrapper, streak card `rounded-xl border-orange-300 bg-card p-6 md:grid-cols-3`                                                                                                                                                                | Wrapper vs card structure differs                                                                                                           |
| Streak hero: orange border, flame, "ต่อเนื่อง 2 วันแล้ว!", 2/10 progress, recommended lesson + black เริ่มการฝึก                                                                                     | Streak card: flame + count + start date + progress bar, "แนะนำการฝึกวันนี้" + first lesson + Play button, empty placeholder circle                                                                                                                                | Progress: 2/10 static vs dynamic; recommended lesson matches; placeholder circle extra                                                      |
| Filter badges: "ทั้งหมด (3)" black active, 3 neutral                                                                                                                                                 | 4 badges: ทั้งหมด, กำลังเรียน, เสร็จแล้ว, ยังไม่เริ่ม (with counts), active = `bg-foreground`                                                                                                                                                                     | Extra badge, count on "ทั้งหมด" missing                                                                                                     |
| Search input + magnifying glass                                                                                                                                                                      | Search input + magnifying glass                                                                                                                                                                                                                                   | ✅ Match                                                                                                                                    |
| Lesson grid: `md:2 xl:3`, card `rounded-2xl border shadow-none`, thumbnail `h-32 bg-neutral-200` + mascot overlay, title 18px bold, chapter, description, 2 stat cells, full-width black เริ่มการฝึก | Grid `md:2 xl:3`, card `shadow-none border border-border rounded-2xl`, image placeholder `h-32 bg-muted` + `rounded-full bg-muted-foreground/20`, title, hardcoded "บทที่ 1", hardcoded description, word count + "-" practice count, Play button `bg-foreground` | Thumbnail style differs (mascot overlay vs gray circle), chapter hardcoded, practice count always "-", button color `bg-foreground` ≈ black |

### 3. Practice Session (`/practice/session`)

| Mockup                                                                                                                                                                                                            | Current                                                                                                                                                                                                                                       | Delta                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Header `h-16`, ghost red "ยกเลิกการฝึก" (ChevronLeft) + avatar right                                                                                                                                              | `HeaderOnlyShell` (no sidebar), no cancel button, no breadcrumb                                                                                                                                                                               | Missing: cancel button, breadcrumb, avatar in header                                                                     |
| Breadcrumb: Dashboard / Lesson / Practice                                                                                                                                                                         | None                                                                                                                                                                                                                                          | ❌ Missing entirely                                                                                                      |
| Layout: 3-col `lg:grid-cols-[230px_1fr_230px]`                                                                                                                                                                    | Same 3-col grid                                                                                                                                                                                                                               | ✅ Match                                                                                                                 |
| **LEFT**: lesson title, 5 progress squares (emerald/neutral), "คำที่ 2/5", word list with scores (emerald/orange/neutral), difficulty dots (2 orange + 3 black)                                                   | **LEFT**: "บทเรียน คำศัพท์ง่าย", difficulty dots (2 orange + 3 gray), word list `◎` bullets colored by status (emerald/orange/muted), current word dot                                                                                        | Progress squares missing; word list shows status not scores; chapter hardcoded                                           |
| **CENTER**: word card `max-w-2xl rounded-xl border`, big word `4xl`, phonetic, English gloss, audio scrubber (Play + progress + Volume2), 2-col camera + lip panels, black "เริ่มการฝึกออกเสียง" + ghost "ข้ามคำ" | **CENTER**: `PracticeWord` — word `text-5xl` + viseme badge, camera section (start/stop, video, mouth-open meter), speech section (start/stop listening, transcript, status), Submit `bg-green-600` + ข้ามคำ outline, score card after result | Audio scrubber missing; separate camera/speech sections vs combined; Submit is green not black; score card appears after |
| **RIGHT**: Tips card (3 bullets), progress bars (voice 30% / lip 70%), readOnly input "กำลังรอเสียง...", encouragement box + mascot circle                                                                        | **RIGHT**: Tips card (3 hardcoded bullets), progress bars with emoji labels (💡🎤👄), motivational box (hardcoded conditionals), placeholder circle                                                                                           | Progress bars: voice/lip vs sound/words-practiced; readOnly input missing; encouragement vs motivational box             |

### 4. Settings (`/settings`)

| Mockup                                                                                                                                                              | Current                                                                                                                                                                                              | Delta                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Page bg `bg-neutral-50`, content `px py-10 lg:ml-60`                                                                                                                | Page bg `bg-background`, content `mx-auto max-w-6xl space-y-10 p-6 lg:p-8`                                                                                                                           | Background color differs (neutral-50 vs white/dark)                     |
| Title "System Settings" 3xl bold, underline tab "Settings"                                                                                                          | `h1` "System Settings" + inline underline `border-b border-border pb-2`                                                                                                                              | Tab "Settings" missing                                                  |
| Wrapper `rounded-xl bg-neutral-100 p-4`                                                                                                                             | Section `space-y-8 rounded-xl bg-muted p-6 lg:p-8`                                                                                                                                                   | Wrapper color differs (neutral-100 vs muted)                            |
| Mic switch `data-[state=checked]:bg-black`                                                                                                                          | Switch `data-[state=checked]:bg-foreground`                                                                                                                                                          | Black vs near-black                                                     |
| Card `rounded-2xl border bg-white shadow-none`, 2x2 grid: Input device Select, Mic sensitivity Slider 60%, Test mic row (black Start Test + level bar + "Level: -") | Card `overflow-hidden rounded-2xl border-border bg-card shadow-none`, grid `md:2`: Input device Select, Mic sensitivity Slider + % display + Test mic (Start/Stop toggle, animated bar, "Level: N%") | Slider shows live %; test mic is toggle + animated bar vs single button |

### 5. Sign-In (`/auth/signin`)

| Mockup                                                                                                | Current                                                                             | Delta                                                               |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Page bg `bg-white`, header `h-14` with nav right: ghost "Login" + black "Get started"                 | Page bg `bg-background`, header with logo left + nav right: "Login" + "Get started" | Header structure differs (logo left vs mockup logo in header left?) |
| Centered card `max-w-md rounded-2xl border shadow-none`                                               | Same card structure                                                                 | ✅ Match                                                            |
| CardTitle "Login to your account" + subtext + "Sign Up" link top-right                                | Title + description + "Sign Up" link top-right (overlaps)                           | ✅ Match                                                            |
| Email + Password inputs `h-9 rounded-md border-neutral-300`, placeholder `neutral-400`, EyeOff toggle | Inputs `h-9 rounded-md border-border`, EyeOff toggle **NON-FUNCTIONAL**             | Border color themed; toggle broken                                  |
| Divider                                                                                               | None                                                                                | ❌ Missing                                                          |
| Black full-width "Login" button                                                                       | `bg-primary` (near-black) `hover:bg-accent`                                         | Color close                                                         |
| Outline "Login with Google" (blue G)                                                                  | Outline Google button **NON-FUNCTIONAL**, generic G                                 | Button broken                                                       |
| Footer: "Don't have an account?" + "© 2026 Vispeech"                                                  | Footer: "Don't have an account?" (no link), no copyright                            | Link missing, copyright missing                                     |
| **Dark mode**: Not specified                                                                          | Error box `bg-red-50 text-red-600` **LIGHT-ONLY** — breaks in dark                  | ❌ Critical                                                         |

### 6. Sign-Up (`/auth/signup`)

| Mockup                                                                                                                                            | Current                                                                                                                                                                                                   | Delta                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Identical to signin except: title "Create your account", "Sign In" link, Email/Password/Confirm Password, "Sign-up" button, "Sign-up with Google" | Same structure as current signin, extra Confirm Password (EyeOff **NON-FUNCTIONAL**), title "Create your account", footer text **WRONG**: "Don't have an account?" (should be "Already have an account?") | Footer text bug; both toggles broken |

### 7. Summary (`/summary`)

| Mockup                                                                                                                                                        | Current                                                                                                                                                              | Delta                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Page bg `bg-neutral-50`, header `h-16` (logo+avatar), breadcrumb + actions (ghost เริ่มการฝึกซ้ำ + black กลับหน้าหลัก)                                        | Action bar only (ghost เริ่มการฝึกซ้ำ + primary กลับหน้าหลัก), no breadcrumb, no header logo/avatar                                                                  | Missing breadcrumb + header context               |
| Card `rounded-2xl border bg-white shadow-none`                                                                                                                | Card `rounded-2xl border border-border bg-card`                                                                                                                      | Border themed                                     |
| Hero: mascot circle `h-44`, "เยี่ยมมากเลย! ฝึกครบทุกคำแล้ววันนี้เก่งมาก!", "Lesson คำศัพท์ง่าย", 4 filled + 1 empty yellow stars                              | Trophy container `h-44 w-44 bg-muted` → inner `h-32 w-32 bg-muted-foreground/20` → Trophy icon, same title, "ความแม่นยำเฉลี่ย X.X%", 5 stars (filled/outline yellow) | Mascot → Trophy; added accuracy %; stars 5 vs 4.5 |
| Results table section `bg-neutral-100 rounded-t-xl`: header + rows (CheckCircle2 emerald / AlertTriangle orange), word+phonetic left, score+ChevronDown right | Results table: `bg-muted` header, collapsible rows (CheckCircle2 emerald / AlertTriangle orange), word+phonetic+score%, ChevronDown/Up                               | Header color differs; score shown inline          |
| Expanded row: lip feedback (orange), sound feedback (emerald), Sparkles tip                                                                                   | Expanded: lip (Smile), sound (Volume2), recommendation (Sparkles orange, hardcoded text)                                                                             | Icons differ; recommendation hardcoded            |

### 8. Progress Dashboard (`/dashboard`)

| Mockup                                                                                                               | Current                                                                                                                                    | Delta                                                    |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Content `rounded-xl border bg-white p-5`, h1 "ความก้าวหน้าทั้งหมด" + BarChart3                                       | `mx-auto max-w-6xl space-y-10`, header BarChart3 + h1                                                                                      | Wrapper differs                                          |
| Grid `xl:2`, cards `rounded-2xl border`, highlighted = `border-black` + AlertTriangle badge orange                   | Grid `xl:2`, LessonCard: highlighted `border-foreground` + AlertTriangle `fill-orange-500`                                                 | Highlight border: black vs foreground (near-black)       |
| Card: title+chapter, description, progressText, progress bar `bg-neutral-300 h-5` fill `bg-black`                    | Card: title+chapter (hardcoded "บทที่ 1"), description, progress text, progress bar `h-5 rounded-full bg-muted` fill `bg-foreground`       | Progress bar track/fill colors differ; chapter hardcoded |
| Completed: yellow Badge 84.6% (Star) + orange Badge "มี 2 คำที่ควรฝึกเพิ่ม"                                          | Completed: Star `bg-yellow-100 text-yellow-700` + AlertTriangle `bg-orange-100 text-orange-700`                                            | Badge styling differs (inline vs Badge component)        |
| Buttons: completed → "สรุปผล"(BarChart3) + ghost "เริ่มการฝึกซ้ำ"(RotateCcw); incomplete → black "เริ่มการฝึก"(Play) | Buttons: completed → "สรุปผล"(BarChart3, `bg-primary`) + ghost "เริ่มการฝึกซ้ำ"(RotateCcw); incomplete → "เริ่มการฝึก"(Play, `bg-primary`) | Primary button: black vs `bg-primary` (near-black)       |
| Mascot circle bottom-right + dashed decoration on highlighted                                                        | Decorative circle `h-28 w-28 bg-muted` + dashed border (highlighted only)                                                                  | Matches concept                                          |

### 9. Right Result Sidebar (Post-Practice)

| Mockup                                                                                                                                       | Current                                                                                                            | Delta                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Floating `rounded-3xl` white sidebar `max-w-sm shadow-xl` over `bg-black/10` dim                                                             | Fixed `bottom-2 right-2 top-2 z-50 max-w-sm`, `backdrop-blur-sm` overlay, `bg-white shadow-xl` **HARDCODED WHITE** | Radius: 3xl vs unspecified; background: white + dim vs blur + hardcoded white (breaks dark) |
| Header: "ผลการฝึกแต่ละคำ" + subtext + badges (yellow 84.6% Star, orange AlertTriangle)                                                       | No header badges                                                                                                   | Missing badges                                                                              |
| Word cards: `rounded-lg border`, row (status icon + word + phonetic \| score + ChevronUp/Down), expanded shows lip/sound/recommendation rows | Collapsible word results with lip/sound/feedback + recommendations                                                 | Structure similar                                                                           |
| Footer: `rounded-full` black "ปิด" + outline "เริ่มการฝึกซ้ำ"                                                                                | "ปิด" (black button) + "เริ่มการฝึกซ้ำ" (outline)                                                                  | Close button radius differs                                                                 |

---

## Cross-Cutting Issues

### Design System Conflict

- **`DESIGN.md`** specifies indigo `#4F46E5` primary, Geist font, specific shadows/radii
- **Mockups** use pure black `#000` primary, `font-sans`, `shadow-none`, `rounded-2xl`
- **Current** uses near-black `--primary #171717`, IBM Plex Sans Thai, `shadow-none`, `rounded-2xl`
- **Verdict**: Mockups ≠ DESIGN.md. Current follows mockups closer but not exactly.

### Dark Mode — Broken

| Component                     | Light-Only Colors Used                                                  |
| ----------------------------- | ----------------------------------------------------------------------- |
| Sign-In error box             | `bg-red-50 text-red-600`                                                |
| Sign-Up error box             | `bg-red-50 text-red-600`                                                |
| PracticeResultSidebar         | `bg-white` (hardcoded)                                                  |
| Summary trophy/mascot         | `bg-muted-foreground/20` (works) but placeholder circles use `bg-muted` |
| Settings test bar placeholder | `bg-muted` circle (works)                                               |

No theme toggle UI exists. `.dark` class works in CSS but never applied.

### Non-Functional Interactive Elements

- Password visibility toggles: Sign-In ×1, Sign-Up ×2 — **no onClick handlers**
- Google auth buttons: Sign-In + Sign-Up — **no handlers**
- Sign-In header "Login" button on sign-in page (redundant)

### Hardcoded Placeholders

- Chapter: "บทที่ 1" everywhere (Home, Dashboard, Practice)
- Practice count badge: always "-"
- Practice tips: 3 hardcoded bullets
- Motivational messages: hardcoded conditionals
- Recommendation text: hardcoded "ลองอ้าปากกว้างขึ้นและออกเสียงดังขึ้นเล็กน้อย"
- Empty state illustrations: `bg-muted` / `bg-muted-foreground/20` circles throughout

### Unused Data

- Summary fetches `total_attempts`, `passed_count`, `best_score`, `created_at` — **only `totalAccuracy` displayed**
- Dashboard lessons from DB `viseme_group` but chapter hardcoded

### Copy Inconsistency

- App pages: Thai
- Settings: English ("System Settings", "Input device", "Microphone sensitivity", "Test microphone")
- Mockups: Settings also Thai ("การตั้งค่า")

---

## Priority Fixes (Lazy Order)

1. **Dark mode**: Replace all `bg-red-50`/`text-red-600`/`bg-white` with themed tokens (`bg-destructive`, `text-destructive-foreground`, `bg-card`). Add theme toggle + persistence.
2. **Broken buttons**: Wire up password toggles + Google auth (or remove if not implementing).
3. **Primary color**: Change `--primary` from `#171717` to `#000000` to match mockups exactly.
4. **Header**: Add divider + "Vispeech" text next to logo per mockup.
5. **Sidebar width**: Change `w-[266px]` → `w-60` (240px).
6. **Practice session**: Add breadcrumb, cancel button, audio scrubber, readOnly "waiting for voice" input, merge camera/speech into single flow per mockup.
7. **Settings**: Page bg `bg-neutral-50` (light) / dark equivalent; wrapper `bg-neutral-100`; switch `bg-black`; tab "Settings" label.
8. **Sign-In/Sign-Up**: Add divider, fix footer link + copyright, fix signup footer text.
9. **Summary**: Add breadcrumb header, swap trophy→mascot, remove accuracy %, show 4.5 stars.
10. **Dashboard**: Highlight border `border-black` (not foreground), progress bar `bg-neutral-300` fill `bg-black`, badge components per mockup.
11. **Result Sidebar**: `rounded-3xl`, `bg-black/10` backdrop, header badges, `rounded-full` close button.
12. **Dynamic data**: Replace all hardcoded "บทที่ 1", "-", tips, recommendations with real data.

---

## What Mockups Don't Specify (Don't Build)

- Dark mode variants (mockups are light-only)
- i18n infrastructure (Thai hardcoded in mockups)
- Real authentication (Google auth buttons non-functional in mockups too)
- Real camera/speech implementation (mockups show UI only)
- Chapter navigation / lesson management UI
- User profile page (only sidebar "โปรไฟล์" → /settings)

---

## Files to Touch (Minimal Set)

| File                                                | Changes                                                                                                    |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                               | `--primary: #000000`; add dark-mode-safe tokens for error/destructive                                      |
| `src/components/layout/Header.tsx`                  | Add divider + "Vispeech" text                                                                              |
| `src/components/layout/Sidebar.tsx`                 | `w-60`; active `bg-neutral-100` (light)                                                                    |
| `src/app/(app)/home/page.tsx`                       | Filter badges: single "ทั้งหมด" active; lesson cards: mascot overlay, dynamic chapter, real practice count |
| `src/app/practice/session/page.tsx`                 | Add breadcrumb, cancel button, audio scrubber, restructure center per mockup                               |
| `src/components/practice/PracticeWord.tsx`          | Unify camera+speech, black primary action, readOnly voice input                                            |
| `src/app/(app)/settings/page.tsx`                   | Page bg `neutral-50`, wrapper `neutral-100`, black switch, tab label, slider % display                     |
| `src/app/auth/signin/page.tsx`                      | Divider, functional EyeOff, functional Google, footer link + copyright, dark-safe error                    |
| `src/app/auth/signup/page.tsx`                      | Same + fix footer text + Confirm Password toggle                                                           |
| `src/app/summary/page.tsx`                          | Breadcrumb header, mascot hero, 4.5 stars, table header `neutral-100`                                      |
| `src/app/(app)/dashboard/page.tsx`                  | Highlight `border-black`, progress bar `neutral-300`/`black`, Badge components                             |
| `src/components/practice/PracticeResultSidebar.tsx` | `rounded-3xl`, `bg-black/10` backdrop, header badges, `rounded-full` close                                 |

---

_Generated from design-example/ TSX mockups vs src/ implementation map (explorer task exp-1)._
