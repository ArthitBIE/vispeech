---
status: complete
phase: 01-mvp-core
source: 01-SUMMARY.md, 02-SUMMARY.md, 03-SUMMARY.md, 04-SUMMARY.md, 05-SUMMARY.md, 06-SUMMARY.md, 07-SUMMARY.md, 08-SUMMARY.md
started: 2026-07-07T14:27:00Z
updated: 2026-07-08
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Server boots, root page loads and redirects to /auth. Auth page shows Thai language UI with app title "vispeech", subtitle, login form (อีเมล / รหัสผ่าน fields), and "เข้าสู่ระบบ" button.
result: pass

### 2. Auth Page — Toggle Signup Mode
expected: Click "ยังไม่มีบัญชี? สมัครสมาชิก" toggles to signup mode. Heading changes to "สมัครสมาชิก", button shows "สมัครสมาชิก". Toggle back shows login mode.
result: pass

### 3. Sign Up — Create Test Account
expected: Fill email + password (≥6 chars), click "สมัครสมาชิก". If Supabase responds, user is created and redirected to /dashboard. (If Supabase not fully configured, appropriate Thai error message appears.)
result: pass

### 4. Dashboard — Empty State
expected: After signup/login, dashboard page shows empty state with a call-to-action for first-time users (encouraging them to start practicing).
result: pass

### 5. Dashboard — Summary Cards
expected: 3 summary cards visible (words practiced, average score, total attempts). Cards show Thai labels and zero/default values for new users.
result: pass

### 6. Dashboard — Word Accuracy Table
expected: Word accuracy table showing seeded Thai words with columns for best/avg score, attempt count, last practiced. Each word has a "Practice" button linking to /practice/[word].
result: pass

### 7. Dashboard — Practice History
expected: Practice history log section displayed (empty for new users with appropriate message).
result: pass

### 8. Practice Page — Word Display & Layout
expected: Clicking "Practice" on a word navigates to /practice/[word]. Page shows the Thai word prominently, viseme group badge, camera preview section, speech recognition section, and submit button.
result: pass
detail: |
  - heading "แม่"
  - viseme badge "กลุ่มรูปปาก: ริมฝีปากปิด"
  - instruction text in Thai
  - camera section: heading "กล้อง", button "เริ่มกล้อง", "การเปิดปาก: 0%"
  - speech section: heading "เสียงพูด", button "เริ่มพูด"
  - "ส่งผล" button (disabled) — disabled because `mouthOpen=0` and `transcript=""`
  - back button: "← กลับไปหน้าแดชบอร์ด"

### 9. Practice Page — Demo Fallback Mode
expected: If real camera/speech not available, demo fallback activates (simulated mouth-open values, demo speech recognition). "เริ่มฝึก" or start button triggers demo mode.
result: pass
detail: |
  Verified via 6 e2e tests passing (camera no-face timeout triggers demo mouthOpen, speech fallback produces transcript, full submit flow works end-to-end). Fixes applied in commit 40a41cb: try-catch around `instance.start()` with 5s no-face timeout fallback, `recoverableErrors` includes `audio-capture`/`not-allowed`, cleanup refs, `data-testid` attributes.

### 10. Score Submission & Results
expected: After practicing, submitting score sends to POST /api/score. Results display shows visual score, audio score, total score, and Thai feedback per tier. Data saved to practice_logs and word_accuracy.
result: pass

### 11. Practice Navigation — Try Again / Back
expected: "ลองอีกครั้ง" (Try Again) resets the practice page for another attempt. "กลับไปหน้าแรก" (Back to Dashboard) navigates back to /dashboard.
result: pass
detail: |
  - "← กลับไปหน้าแดชบอร์ด" button navigates from practice page back to dashboard.
  - "ลองอีกครั้ง" resets the form — verified via e2e (submit → score visible → click try again → score hidden, submit disabled).

### 12. Dashboard — Updated After Practice
expected: After completing a practice session and returning to dashboard, summary cards reflect updated counts, word accuracy table shows the practiced word with score data, and practice history shows the new entry.
result: pass

### 13. Thai Language Throughout
expected: All UI text is in Thai — nav, labels, buttons, error messages, feedback text, dates in Thai locale.
result: pass
detail: |
  - Auth page: Thai labels (อีเมล, รหัสผ่าน, เข้าสู่ระบบ, สมัครสมาชิก), Thai error messages for unverified email
  - Dashboard: Headings, cards (คำที่ฝึกแล้ว, คะแนนเฉลี่ย, จำนวนครั้งที่ฝึก), table headers (คำ, กลุ่มรูปปาก, คะแนนดีที่สุด, คะแนนเฉลี่ย, จำนวนครั้ง, ฝึกล่าสุด), practice history empty state in Thai, "เริ่มฝึก" CTA
  - Practice page: word heading, viseme group badge, instruction, labels (กล้อง, การเปิดปาก, เสียงพูด), buttons (เริ่มกล้อง, เริ่มพูด, ส่งผล), back button (← กลับไปหน้าแดชบอร์ด)
  - Page title: "vispeech - ฝึกออกเสียงภาษาไทย"
  - Error messages and feedback returned from /api/score are in Thai

### 14. TypeScript Build
expected: `npx tsc --noEmit` passes with zero errors.
result: pass

### 15. Production Build
expected: `npm run build` completes with zero errors. All routes correctly identified as static or dynamic.
result: pass (with warnings)
detail: |
  Build successful with 2 non-blocking warnings:
  - Workspace root detection warning (multiple lockfiles found — config fix available via turbopack.root)
  - Middleware → proxy deprecation warning (Next.js 16 convention migration)
  Routes: / (static), /auth (static), /dashboard (static), /home (static), /api/score (dynamic), /practice/[word] (dynamic), proxy middleware.

## Summary

total: 15
passed: 13
issues: 0
pending: 0
skipped: 0

## Gaps

