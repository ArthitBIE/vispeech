# Contributing to ViSpeech

Thanks for your interest in contributing. This guide covers the workflow, conventions, and expectations for this project.

## Branching model

- `main` — stable, deployable. Protected by the full CI suite.
- `develop` — integration branch. All PRs target `develop`.
- Feature branches branch off `develop`. Name them descriptively, e.g. `fix/auth-cookie-verify`, `feat/word-search`.

## Before you start

1. Fork the repository (or create a branch if you have write access).
2. Clone and install: `pnpm install`.
3. Copy `.env.local.example` to `.env.local` and add your Supabase credentials.
4. Run the full test suite to confirm your baseline: `pnpm test`.

## Development workflow

```bash
# Start the dev server
pnpm dev

# Run unit tests
pnpm test:unit

# Run E2E tests (requires .env.local with E2E_TEST_EMAIL / E2E_TEST_PASSWORD)
pnpm test:e2e

# Type-check the whole project
bunx tsc --noEmit
```

## Code style

- **TypeScript strict mode.** Don't cast with `as` to silence type errors — fix the underlying type.
- **pnpm only.** Don't run `npm` or `bun` for installs; the `packageManager` field is pinned to pnpm 11.
- **Conventional commits** are not enforced, but commit messages should explain _why_, not just _what_. Reference measurements, edge cases, and the trade-offs you considered.

## Tests

- Unit tests live alongside code in `src/**/__tests__/`. Use Vitest.
- E2E tests live in `e2e/`. Use Playwright.
- A husky pre-commit hook runs lint-staged (Prettier) plus `vitest run && playwright test`. Don't bypass it — if the hook blocks you, fix the underlying failure instead.

## Security-relevant code

Several parts of this codebase are load-bearing for security. Read these docs before touching them:

- `docs/ARCHITECTURE.md` — system design and auth model
- `docs/CONFIGURATION.md` — Supabase redirect allow-list and what happens when it drifts

In particular:

- **`src/proxy.ts`** parses the session cookie but does not verify it. Real enforcement happens in `src/lib/auth/dal.ts` (`verifySession()`). Don't move verification back into the proxy — it's an intentional split between optimistic checks and verified ones.
- **Redirect URLs** in Supabase are an allow-list, not a regex. A wildcard host entry lets attackers register a matching project and receive a victim's tokens. The CI check in `scripts/check-redirect-allowlist.mjs` rejects wildcards in the host position — that rejection is a feature.
- **`src/lib/supabase/server.ts`** uses `Authorization: Bearer <token>` headers for API route auth. Don't switch to cookie-based auth for API routes — the client doesn't send cookies with `fetch()` by default, and the server can't read them.

## Submitting changes

1. Push your feature branch.
2. Open a PR against `develop`.
3. Describe what the change does, why it's needed, and what you measured (if applicable).
4. CI must pass before merging. If a check fails, look at the actual error — some failures are the workflow telling you something is genuinely wrong (e.g. the auth-config workflow failing when `SUPABASE_ACCESS_TOKEN` is missing is by design).

## Code review

Reviewers look for:

- Security implications of any change to auth, scoring, or data access.
- Whether new tests cover the behavior being added or changed.
- Whether the change breaks an existing contract (public API, env var name, route path).
- Honest reporting of limitations and edge cases — don't oversell.

## Questions?

Open an issue using the appropriate template. For security vulnerabilities, see [SECURITY.md](SECURITY.md) instead.
