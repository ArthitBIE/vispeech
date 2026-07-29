# Deepwork: Judge Presentation UI Polish

## Goal
Make ViSpeech app match Figma designs for judge presentation (1 week deadline).
"Working webpage" is a competition scoring category.

## Confirmed Context
- Repo: ViSpeech — Thai speech training web app for hearing-impaired
- Stack: Next.js + Tailwind + shadcn + Supabase + MediaPipe + Web Speech API
- `design-example/` contains TSX reference implementations + `UX/` with Figma reference images

## Known Gaps
1. `/(app)/dashboard` — still old table layout, NOT using `progress-dashboard.tsx` design
2. `after-finished-right-sidebar-component..tsx` — not integrated anywhere (should show after practice completes)
3. Sidebar nav routes all resolve correctly but `/dashboard` shows wrong UI
4. UX reference images in `design-example/UX/` — design TSX files are "really close" but not exact

## User Clarifications
- TSX files ≈ Figma design (close enough, not exact)
- After-finished sidebar → after user finishes practice session
- Use real Supabase data + E2E testing

## Plan (Draft — awaiting Oracle review)

### Phase 1: Dashboard Progress Page
Replace `/(app)/dashboard` with progress-dashboard Figma design + real data.
Files: `design-example/progress-dashboard.tsx` → `src/app/(app)/dashboard/page.tsx`

### Phase 2: After-Finished Sidebar
Integrate `after-finished-right-sidebar-component..tsx` into practice session flow.
Show after all words practiced.

### Phase 3: Navigation Fix
Audit all links across pages, fix any broken nav targets.

### Phase 4: Visual Refinement
Polish each page to match design-example TSX more closely.

### Phase 5: Build + E2E
Verify build + Playwright E2E tests for main user flows.

## Oracle Review Notes
—

## Status
- [ ] Phase 1: Dashboard
- [ ] Phase 2: After-finished sidebar
- [ ] Phase 3: Navigation fix
- [ ] Phase 4: Visual refinement
- [ ] Phase 5: Build + E2E
