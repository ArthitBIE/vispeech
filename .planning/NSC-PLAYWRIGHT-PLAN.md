# Playwright NSC UI verification plan

## Goal

Verify and screenshot the redesigned vispeech frontend for NSC Thailand documentation.

Pages: `/dashboard`, `/practice/session`

## No code changes (except temporary Playwright script)

- No changes to: backend logic, API routes, Supabase schema, scoring, frontend app logic, state management, handlers, architecture
- Allowed: create standalone Playwright script, use existing auth state, capture screenshots, report visual issues

## Steps

1. **Build check** — `npm run build`, expect 0 errors
2. **Create screenshot dir** — `mkdir -p test-results/nsc`
3. **Start app** — `npm run dev` if not already running
4. **Create `e2e/nsc-verify.mjs`** — standalone script using Playwright core:
   - Launch Chromium at 1440x900 with `--use-fake-device-for-media-stream`
   - Load existing `e2e/.auth/user.json` as storage state
   - Visit `/dashboard` → verify labels → screenshot `01-dashboard-overview.png`
   - Visit `/practice/session` → verify ready state → screenshot `02-session-ready.png`
   - Click "เริ่มฝึกคำนี้" → verify camera/speech cards → screenshot `03-session-practicing-camera-speech.png`
   - Click "เริ่มพูด" → verify listening state → optional screenshot
   - Submit score → verify scored state → screenshot `04-session-scored-feedback.png`
   - Click "จบเซสชัน" → verify summary → screenshot `05-session-summary.png`
5. **Responsive check** — repeat dashboard + session at 1280x800, verify no overflow

## Error tolerance

| Scenario | Action |
|----------|--------|
| Build fails | Stop, report |
| Auth token expired | Stop, report "need E2E_TEST_EMAIL/PASSWORD" |
| Camera unavailable | MediaPipe fallback still works |
| Speech unavailable | Fallback returns demo-transcript |
| Submit stays disabled | Skip scoring, report env limitation |
| Score API fails | Skip, screenshot what we can |
