# src/components/

## Responsibility

UI component layer for the Vispeech client app. Three groups: presentational primitives (`ui/`), layout compositions (`layout/`), and interactive practice-domain components (`practice/`), plus a config-state warning banner (`SupabaseNotConfigured.tsx`). No business logic lives here beyond component-local orchestration of media/speech capture in `practice/`.

## Design

- **shadcn/ui primitives** (`ui/`): generated registry components (button, card, sheet, dropdown-menu, avatar, breadcrumb, badge, etc.). Pattern: CVA (`cva` + `VariantProps`) for variant props on styled primitives (button, badge, input, card, label, select, table), Radix UI headless primitives for interactive ones (dropdown-menu, select, sheet, tabs, tooltip, switch, slider, collapsible, separator), `cn()` from `@/lib/utils` for class merging. Unmodified registry output.
- **Layout composition** (`layout/`): shell hierarchy — `AppShell` (header + persistent sidebar + mobile Sheet-drawn sidebar), `HeaderOnlyShell`, `BareShell` (pass-through `{children}`). `Header`/`Sidebar` are client components that self-fetch auth/streak state. `AppBreadcrumb` is a controlled list renderer; `TitleLogo` is a static Next `<Image>`.
- **Practice components** (`practice/`): `PracticeWord` is the core interactive component — uncontrolled media session with refs (`useRef`) for camera/face-mesh/audio/recognizer lifecycle and state for UI; it owns the "start → practice → submit → result → try again" state machine. `PracticeResultSidebar` is a controlled overlay (open via prop) with locally managed expand state. `LipExample` is a pure presentational mapping `viseme_group → LipShape` → CSS classes (exported `visemeToLipShape` for testability).
- **Callback-driven parent communication**: `PracticeWord`/`PracticeResultSidebar` expose `onScored`/`onSkip`/`onLive`/`onClose`/`onRestart` props instead of lifting state directly.

## Flow

1. Routes render shells from `layout/` (AppShell under `(app)/`, HeaderOnlyShell under `summary/`/`practice/`): children injected via `{children}` slot pattern.
2. `Header` on mount → `supabase.auth.getSession()` → sets avatarUrl/avatarLetter from `user.user_metadata`; avatar opens `DropdownMenu` → router.push to `/settings` or `/auth`.
3. `Sidebar` on mount → `supabase.auth.getSession()` → `supabase.from("practice_logs").select("created_at")` → `computeStreak(keys)` from `@/lib/streak` → renders streak card + 5-day flame grid + progress vs `STREAK_GOAL`.
4. `PracticeWord` start → `handleStartPractice` → `initFaceMesh(video, canvas)` (`@/lib/mediapipe`) + `createSpeechRecognizer("th-TH")` (`@/lib/viseme`) + `getUserMedia` → mouthOpen (face-mesh `onResult`) and audioLevel (AnalyserNode rAF loop) + transcript (recognizer `onResult`); every change pushed via `onLive`.
5. Submit → `handleSubmit` → `supabase.auth.getSession()` for bearer token → `POST /api/score` `{wordId, transcript, mouthOpen, sessionId, targetText, visemeGroup}` → `ScoreResult` → `onScored(result)` → parent advances word/session.
6. TTS: `playWordSound` → `speakThai(word.word)` (`@/lib/tts`); on error falls back to `fetch("/api/tts")` → blob → `Audio` element; progress via `onProgress`/`timeupdate`.
7. Unmount/word-change cleanup: single `useEffect([])` cleanup stops recognizer, face-mesh (`stopCameraRef`), audio ctx, rAF, TTS, revokes blob URLs.
8. `SupabaseNotConfigured` renders when env check fails in auth routes; `ctaHref` links to sign-in.

## Integration

- Consumed by: `src/app/(app)/layout.tsx` (AppShell), `src/app/summary/layout.tsx` + `src/app/practice/layout.tsx` (HeaderOnlyShell), `src/app/auth/*` (SupabaseNotConfigured, BareShell), `src/app/practice/session/page.tsx` (PracticeWord, LipExample, PracticeResultSidebar), `src/app/(app)/dashboard/page.tsx` + `home/page.tsx` (AppBreadcrumb, layout components), `src/app/api/*`.
- Depends on: `@/components/ui/*` (shadcn primitives), `@/lib/utils` (`cn`), `@/lib/supabase/client` (Header, Sidebar, PracticeWord), `@/lib/mediapipe` (`initFaceMesh`, `FaceMeshInstance`), `@/lib/viseme` (`createSpeechRecognizer`, `SpeechRecognizer`), `@/lib/tts` (`speakThai`, `stopSpeaking`), `@/lib/streak` (`computeStreak`, `dateKey`, `lastNDays`, thai date formatters), `@/lib/constants` (`STREAK_GOAL`), `next/link`, `next/image`, `next/navigation`, lucide-react icons, `POST /api/tts` + `POST /api/score` server routes.
