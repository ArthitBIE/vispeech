# Plan: Dashboard E2E Tests

## Overview

Add comprehensive Playwright E2E tests for the dashboard page covering all features implemented across 5 rounds of iteration: stats, encouragement, welcome card, dismissible callout, filter tabs (with collapse), sort, search, page size, pagination (with direct input), keyboard shortcuts, logout confirmation, and error boundary.

Current gap: `e2e/dashboard.spec.ts` doesn't exist. `e2e/practice.spec.ts` covers practice flows and `e2e/auth.spec.ts` covers auth — both skip when `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` aren't set.

---

## Phase 1: Add data-testid Selectors to Dashboard

The dashboard has only 1 data-testid (`dashboard-word-card` on the grid). Add selectors for every interactive element. These are test infrastructure, not feature changes.

### Elements needing data-testid

| data-testid | Element | Purpose |
|-------------|---------|---------|
| `dashboard-stat-practiced` | Practiced count stat card | Verify count and progress bar |
| `dashboard-stat-avg` | Avg score stat card | Verify score display |
| `dashboard-stat-attempts` | Total attempts stat card | Verify total count |
| `dashboard-stat-compact` | Compact stat card (first-timer) | First-timer single stat card |
| `dashboard-encouragement` | Encouragement line | Verify milestone messages |
| `dashboard-welcome` | Welcome card | First-timer onboarding |
| `dashboard-callout` | Info callout | Verify dismissible callout |
| `dashboard-callout-close` | Callout close button | Click to dismiss |
| `dashboard-filters` | Filter tab container | Role tablist, verify tabs |
| `dashboard-filter-toggle` | Filter toggle button | Expand/collapse filters |
| `dashboard-sort` | Sort select | Change sort order |
| `dashboard-search` | Search input | Type to filter |
| `dashboard-page-size` | Page size select | Change items per page |
| `dashboard-page-input` | Page input | Direct page number |
| `dashboard-prev` | Pagination prev button | Navigate back |
| `dashboard-next` | Pagination next button | Navigate forward |
| `dashboard-word-card` | Word card grid (exists) | Already exists on grid wrapper |
| `dashboard-practice-link` | Practice link on word card | Navigate to practice |
| `dashboard-history` | History section heading | Verify practice history |
| `dashboard-history-entry` | History entry row | Individual history row |
| `dashboard-logout` | Logout button | Trigger logout |

---

## Phase 2: Write dashboard.spec.ts

### 2.1 Page structure
- Redirects to /auth without session
- Supabase-not-configured fallback when env missing

### 2.2 Stats section
- Shows three stat cards for returning users
- Compact single card for first-timers (totalPracticed === 0)
- Progress bar width matches practiced/total ratio
- Avg score bar color-coded green/amber/indigo by threshold
- Total attempts shows correct count

### 2.3 Welcome card & info callout
- Welcome card visible when totalPracticed === 0
- Info callout visible when totalPracticed > 0
- Callout dismissal persists across reload (localStorage)
- Welcome and callout never stack simultaneously

### 2.4 Encouragement system
- Hidden when practiced === 0
- Milestone messages at 3/8/15 completed words
- High-score messages at avg >= 80 or >= 90
- 100% completion message when all words practiced

### 2.5 Filter tabs
- Default tab is "all" ("ทั้งหมด")
- Unpracticed filter shows only unpracticed words
- Viseme group filter shows only matching words
- Active tab has selected styling (bg-primary text-surface)
- Count badges match filtered word count
- Changing filter resets pagination to page 1

### 2.6 Filter collapse
- Shows first 6 + "others +N" button when >6 viseme groups
- Expands all groups on click
- "Show less" collapses back to 6

### 2.7 Sort dropdown
- Default sort (no reorder)
- Score ascending/descending
- Difficulty sort
- Recent sort by last_practiced_at
- Sort resets pagination to page 1

### 2.8 Search
- Filters words by partial text match
- No-results empty state
- Resets pagination
- Clear search restores full list
- Combines with active viseme filter

### 2.9 Page size
- Default 10 per page
- Select 20 or 50 per page
- Resets to page 1 on change

### 2.10 Pagination
- Prev disabled on page 1
- Next disabled on last page
- Next navigates forward
- Prev navigates back
- Counter shows "current / total"
- Direct page input navigates to page
- Bounds clamping on out-of-range input

### 2.11 Keyboard shortcuts
- / focuses search input
- / ignored when input/select focused
- j goes to next page
- k goes to previous page
- No action at boundaries (page 1 / last page)
- ArrowRight/ArrowLeft navigate filter tabs

### 2.12 Logout
- Confirmation dialog appears on click
- Cancel keeps user on dashboard
- Accept redirects to /auth

### 2.13 Error boundary
- Catches render error from child, shows fallback
- Refresh button calls window.location.reload

### 2.14 History section
- Loads with date-grouped headers
- Each entry shows word name + visual/audio/total scores
- Timestamp displayed per entry
- Empty state shows message + start link
- Most recent logs at top

---

## Phase 3: Config check

`e2e/dashboard.spec.ts` is already matched by `playwright.config.ts` authenticated project (`testMatch: ["dashboard.spec.ts", "practice.spec.ts"]`). No config change needed.

---

## Execution order

Phase 1 (add data-testids to dashboard/page.tsx) → Phase 2 (write e2e/dashboard.spec.ts) → `npx playwright test e2e/dashboard.spec.ts --project=authenticated`

## Dependencies

1. `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` env vars for authenticated tests
2. Seeded database with words + practice logs for meaningful assertions
3. `data-testid` attributes added to dashboard elements first
4. Dev server via Playwright webServer config (auto)

## Verification

```bash
npx playwright test e2e/dashboard.spec.ts --project=authenticated --reporter=list
```

Expected: ~50-80 tests passing. Auth via global setup (shared storage state), not per-test login.
