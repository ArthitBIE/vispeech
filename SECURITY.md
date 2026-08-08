# Security Policy

## Supported Versions

| Version          | Supported          |
| ---------------- | ------------------ |
| `main`           | :white_check_mark: |
| `develop`        | :white_check_mark: |
| feature branches | best effort        |

Only `main` and `develop` are actively monitored. Running code from a feature branch is at your own risk.

## Reporting a Vulnerability

If you find a security issue in ViSpeech, please report it **privately** — don't open a public issue.

1. Email the maintainer: **atiyutpunkeaw@gmail.com** — use the subject line "Security: [short description]".
2. Include:
   - What you found (URL, file path, behavior).
   - Steps to reproduce (curl commands, screenshots, proof-of-concept code).
   - What an attacker could gain.
   - Any suggested fix or mitigation.

You'll get a confirmation within 48 hours. If the report is accepted, a fix will be released before any public disclosure. Public disclosure before a fix is ready puts users at risk and will not be tolerated.

**Do not**:

- Test vulnerabilities against someone else's Supabase project.
- Access, modify, or delete data you don't own.
- Share the vulnerability publicly before a fix is released.

## What this project considers in scope

- Authentication bypass (e.g., forged session cookies, unsigned JWTs, broken `getUser()` validation).
- Authorization failures (e.g., reading another user's practice data, RLS bypass).
- Open redirects and redirect-allowlist drift.
- SQL injection via API routes.
- Cross-site scripting (XSS) in rendered user content (Practice words, session summaries).
- Server-side request forgery (SSRF) via the TTS route or any outbound fetch.
- Credential leakage (env vars in client bundles, API keys in logs).

## What's out of scope

- Social engineering of users or maintainers.
- Denial-of-service against your own instances.
- Vulnerabilities in upstream dependencies (Supabase, Next.js, React, Playwright) — report to those projects directly.

## Security-relevant code paths

Several parts of this codebase are load-bearing for security. If you're reviewing or reporting against any of these, pay extra attention:

- **`src/proxy.ts`** — Parses the session cookie but intentionally does **not** verify it. Real enforcement lives in `src/lib/auth/dal.ts`. A vulnerability that moves verification back into the proxy would be a regression.
- **`src/lib/auth/dal.ts`** — Calls `supabase.auth.getUser()` server-side. Any change here that weakens validation or removes the redirect is high-severity.
- **`src/lib/supabase/server.ts`** — API route auth via `Authorization: Bearer <token>`. Don't switch to cookie-based auth — the client doesn't send cookies with `fetch()` by default.
- **`scripts/check-redirect-allowlist.mjs`** — Rejects wildcard hosts in the Supabase redirect allow-list. A wildcard lets an attacker register a matching project and receive a victim's tokens. The check is a feature, not noise.

## Security history

Two real defects shaped this policy:

1. **`localhost` redirect entry stopped being honoured** — someone changed the allow-list in the Supabase dashboard without opening a PR. No code change, no review, no test caught it until users reported broken OAuth. This is why CI checks the allow-list against `docs/CONFIGURATION.md` on every push.

2. **Preview wildcard (`*.vercel.app`) let attackers receive tokens** — a wildcard in the host position allows anyone to register a matching Vercel project and complete an OAuth flow with a victim's authorization code. This is why the allow-list check rejects wildcards in the host position.
