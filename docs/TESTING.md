<!-- generated-by: gsd-doc-writer -->
# Testing

ViSpeech uses **Vitest** for unit tests and **Playwright** for end-to-end (E2E) tests. Unit tests validate speech recognition logic in a jsdom environment; E2E tests exercise the full Next.js application against a Supabase backend.

## Test Framework and Setup

| Framework | Package | Version | Config File |
|-----------|---------|---------|-------------|
| Vitest | `vitest` | ^4.1.10 | `vitest.config.ts` |
| Playwright | `@playwright/test` | ^1.61.1 | `playwright.config.ts` |

Install all dependencies before running tests:

```bash
npm install
```

For Playwright, install browsers (required for first-time setup):

```bash
npx playwright install
```

## Running Tests

### Full Test Suite

```bash
npm test
```

Runs Vitest unit tests first, then Playwright E2E tests sequentially.

### Unit Tests Only

```bash
npm run test:unit
```

Equivalent to `vitest run`. Runs all `*.test.ts` files inside `src/` (e2e/ and .opencode/ directories are excluded).

### E2E Tests Only

```bash
npm run test:e2e
```

Equivalent to `npx playwright test`. Runs tests from the `e2e/` directory. The Playwright config auto-starts the Next.js dev server (`npm run dev`) before tests and reuses an existing server if one is already running locally.

### Running a Single Test File

**Unit test:**
```bash
npx vitest run src/lib/viseme/__tests__/fallback.test.ts
```

**E2E test:**
```bash
npx playwright test e2e/auth.spec.ts
```

### Running a Specific Playwright Project

```bash
npx playwright test --project=authenticated
npx playwright test --project=unauthenticated
```

## Test Directory Structure

```
src/
  lib/
    viseme/
      __tests__/
        fallback.test.ts       # Unit tests for speech recognizer
e2e/
  global.setup.ts              # Auth setup (runs before authenticated tests)
  auth.spec.ts                 # Unauthenticated: login form tests
  dashboard.spec.ts            # Authenticated: dashboard page tests
  practice.spec.ts             # Authenticated: practice page tests
  .auth/
    user.json                  # Storage state saved by global setup
supabase/
  seed.sql                     # Database seed data for test environment
```

### Unit Test Pattern

Unit test files live next to the code they test in `__tests__/` directories, using a `*.test.ts` suffix. Tests use Vitest's `describe`/`it`/`expect` globals and `vi` for mocking.

```typescript
import { describe, it, expect, vi } from "vitest";
import { createFallbackRecognizer } from "../index";

describe("createFallbackRecognizer", () => {
  it("start() resolves without error", async () => {
    const recognizer = createFallbackRecognizer();
    await expect(recognizer.start()).resolves.toBeUndefined();
  });
});
```

### E2E Test Projects

The Playwright config defines three projects:

| Project | Spec Files | Dependencies | Storage State |
|---------|-----------|-------------|---------------|
| `setup` | `global.setup.ts` | — | Writes `e2e/.auth/user.json` |
| `unauthenticated` | `auth.spec.ts` | — | None |
| `authenticated` | `dashboard.spec.ts`, `practice.spec.ts` | `setup` | `e2e/.auth/user.json` |

The `authenticated` project depends on `setup`, ensuring Playwright runs the global authentication setup first.

## E2E Authentication

E2E tests require two environment variables for authentication against the Supabase backend:

```
E2E_TEST_EMAIL=your-test-user@example.com
E2E_TEST_PASSWORD=your-test-password
```

The global setup (`e2e/global.setup.ts`) logs in through the `/auth` page using these credentials and saves the session to `e2e/.auth/user.json`. Authenticated test projects then restore this storage state automatically.

Tests that cannot run without credentials skip gracefully:

```typescript
test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set");
```

## Database Test Fixtures

The `supabase/seed.sql` file initializes the database with 32 Thai practice words across 7 viseme groups for test environments:

| Viseme Group | Example Words | Count |
|-------------|---------------|-------|
| ริมฝีปากปิด (Lip closure) | แม่, ไป, มา, พ่อ, นอน | 5 |
| ปากเปิดกว้าง (Wide open mouth) | รัก, ฝาก, หมา, ตา | 4 |
| ปากห่อกลม (Rounded mouth) | ดู, รู้, วิ่ง | 3 |
| ฟันแตะริมฝีปาก (Teeth on lip) | ฝัน, ฟัน, ฟ้า | 3 |
| ปากเปิดกลาง (Mid-open mouth) | เก่ง, แดง, เด็ก, กิน | 4 |
| ทักทาย (Greetings) | สวัสดี, ขอบคุณ, ดี, โชคดี, ขอโทษ | 5 |
| ตัวเลข (Numbers) | หนึ่ง, สอง, สาม, สี่, ห้า, หก, เจ็ด, แปด | 8 |

Apply the seed data with:

```bash
npx supabase db reset
```

## CI Integration

ViSpeech does not currently have a CI pipeline configured. No workflow files were found in `.github/workflows/`.

When CI is added, Playwright will automatically adapt to the CI environment:

- `forbidOnly: true` — prevents `test.only` from being committed
- `retries: 2` — retries failed tests up to 2 times
- `workers: 1` — runs tests serially to avoid resource contention
- `reuseExistingServer: false` — starts a fresh dev server per run

## Coverage Requirements

There is no coverage threshold currently configured in `vitest.config.ts`. To enable coverage thresholds, add a `coverage` section to the Vitest config:

```typescript
// vitest.config.ts (example — not currently configured)
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 80,
    branches: 70,
    functions: 80,
    statements: 80,
  },
},
```

## Configuration Reference

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**', '.opencode/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  projects: [
    { name: "setup", testMatch: "global.setup.ts" },
    { name: "unauthenticated", testMatch: "auth.spec.ts", dependencies: [] },
    {
      name: "authenticated",
      testMatch: ["dashboard.spec.ts", "practice.spec.ts"],
      dependencies: ["setup"],
      use: { storageState: "e2e/.auth/user.json" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```
