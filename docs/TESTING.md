# Testing

## Unit Tests

```bash
npm run test:unit
```

Uses **Vitest** with `@vitejs/plugin-react`. Tests live alongside source code
in `__tests__/` directories.

### Current Test Coverage

- `src/lib/viseme/__tests__/fallback.test.ts` — Tests for the fallback speech
  recognizer: start/stop behavior, transcript format, error callback firing,
  and multi-callback support.

Run a specific file:

```bash
npx vitest run src/lib/viseme/__tests__/fallback.test.ts
```

## E2E Tests

```bash
npm run test:e2e
```

Uses **Playwright** with config in `playwright.config.ts`. Tests the app
through a real browser.

To run with the Playwright UI:

```bash
npx playwright test --ui
```

## Adding Tests

- **Unit tests**: create a `__tests__/` directory next to the source file
- **E2E tests**: add spec files to an `e2e/` or `tests/` directory
- Use `data-testid` attributes on interactive elements for Playwright selectors