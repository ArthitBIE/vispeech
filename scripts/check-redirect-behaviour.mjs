/**
 * Probes the LIVE Supabase project to check that its redirect allow-list
 * actually behaves correctly, rather than merely reading the way we expect.
 *
 * This is the behavioural counterpart to check-redirect-allowlist.mjs. That
 * script compares the live entry strings against docs/CONFIGURATION.md, which
 * catches drift and undocumented entries but cannot tell you what Supabase
 * *does* with those strings. Two real defects on this project were invisible
 * to string comparison:
 *
 *   1. localhost:3000 not being honoured, which silently bounced local sign-in
 *      to production and looked exactly like an application bug.
 *   2. A wildcard whose match semantics were wider than they appeared. The
 *      preview wildcard vispeech-*-arthitbies-projects.vercel.app reads as if
 *      the team slug anchors it to hosts this team owns. It does not: the
 *      vercel.app project namespace is flat, global and first-come, so an
 *      outsider could register a matching name. Only sending the value through
 *      Supabase and watching where the browser is sent reveals that.
 *
 * Oracle: GET /auth/v1/verify with a deliberately bad token. It redirects to
 * the requested host when that host is allow-listed, and falls back to the
 * Site URL when it is not, which is exactly the allow/deny signal needed.
 *
 * Two endpoints that look suitable are not, and were both ruled out
 * empirically before settling on this one:
 *   - /auth/v1/authorize echoes redirect_to into the Google URL verbatim,
 *     even for denied values, so it cannot discriminate. The echoed value is
 *     not a validation signal; always assert on the final landing host.
 *   - /auth/v1/callback with a bogus code errors before redirect_to is
 *     applied, so no redirect is emitted at all.
 *
 * No secrets are needed: this drives only the public auth endpoint. The bad
 * token means no session is ever minted, so the probe cannot authenticate
 * anything, and denied cases simply land on the Site URL.
 *
 * Usage: node scripts/check-redirect-behaviour.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL (read from .env.local if present).
 */
import { readFileSync, existsSync } from "node:fs";

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function supabaseUrl() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "");
  }
  if (existsSync(".env.local")) {
    const m = readFileSync(".env.local", "utf8").match(
      /^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*"?([^"\s]+)"?/m
    );
    if (m) return m[1].replace(/\/+$/, "");
  }
  return null;
}

// See check-redirect-allowlist.mjs: skipping is right locally and wrong in a
// scheduled job, where a missing variable would make this green forever.
const STRICT = process.env.STRICT === "1";

const SUPA = supabaseUrl();
if (!SUPA) {
  const msg = "NEXT_PUBLIC_SUPABASE_URL not set and not found in .env.local.";
  if (STRICT) {
    console.error(`FAIL: ${msg}\nSTRICT=1 is set, so this is an error.`);
    process.exit(1);
  }
  console.log(`SKIP: ${msg}`);
  process.exit(0);
}

// Where Supabase sends a request whose redirect_to it refuses to honour.
// Must equal the host of the Site URL recorded in docs/CONFIGURATION.md.
// If the two drift apart every deny case fails, which looks alarming but is
// not a security finding: the hosts were still refused, they simply landed
// somewhere this constant did not expect. check-redirect-allowlist.mjs now
// asserts the Site URL against the docs so that drift is reported directly.
const SITE_URL_HOST = "vispeech-arthitbies-projects.vercel.app";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The verify endpoint allows only a couple of requests in quick succession.
// Pace the probe so the common path does not spend its time in backoff.
const PACE_MS = 1100;

/**
 * Host the browser would actually be sent to.
 *
 * Returns {host} on success, or {error} when the answer is unknown. The
 * distinction matters: this endpoint rate-limits aggressively (429 after
 * roughly two rapid requests), and a 429 carries no Location header. Treating
 * that absence as "not honoured" would silently score every deny case as a
 * PASS while actually testing nothing, which is the worst possible failure for
 * a security check. So 429 is retried with backoff and, if it persists, is
 * reported as an error rather than folded into a verdict.
 */
async function landingHost(redirectTo, attempt = 0) {
  const qs = new URLSearchParams({
    token: "badtoken",
    type: "magiclink",
    redirect_to: redirectTo,
  });
  let res;
  try {
    res = await fetch(`${SUPA}/auth/v1/verify?${qs}`, {
      redirect: "manual",
      headers: { "User-Agent": UA },
    });
  } catch (err) {
    // No network is not evidence either way. Flagged distinctly from a 429 so
    // the caller can skip rather than report a security verdict it never got.
    return { offline: true, error: `network error: ${err.message}` };
  }

  if (res.status === 429) {
    if (attempt >= 5) return { error: "rate limited (429) after 5 retries" };
    const wait = 2000 * 2 ** attempt;
    await sleep(wait);
    return landingHost(redirectTo, attempt + 1);
  }

  const loc = res.headers.get("location");
  if (!loc) return { error: `no Location header (HTTP ${res.status})` };
  try {
    return { host: new URL(loc).host };
  } catch {
    return { error: `unparseable Location: ${loc}` };
  }
}

const CASES = [
  // [label, redirect_to, expect honoured]

  // Must be honoured. Losing any of these breaks a real sign-in path.
  [
    "localhost callback (ORIGINAL BUG)",
    "http://localhost:3000/auth/callback",
    true,
  ],
  ["production callback", "https://vispeech-pi.vercel.app/auth/callback", true],
  ["production root", "https://vispeech-pi.vercel.app", true],
  [
    "branch preview callback",
    "https://vispeech-git-develop-arthitbies-projects.vercel.app/auth/callback",
    true,
  ],

  // Must be denied. Each is a host an attacker could plausibly control; if any
  // is honoured, Supabase hands over access_token, refresh_token and the
  // Google provider_token in the URL fragment.
  [
    // Matched the removed preview wildcard. Unclaimed vercel.app names of this
    // shape were confirmed registrable, so this must stay denied.
    "EVIL squattable preview shape (REMOVED WILDCARD)",
    "https://vispeech-abc123-arthitbies-projects.vercel.app/auth/callback",
    false,
  ],
  [
    // Matched the removed bare https://*.vercel.app entry.
    "EVIL bare vercel.app (REMOVED HOLE)",
    "https://vispeech-attacker-probe.vercel.app/auth/callback",
    false,
  ],
  [
    "EVIL unrelated vercel.app",
    "https://totally-unrelated-app.vercel.app/auth/callback",
    false,
  ],
  ["EVIL unrelated domain", "https://evil.example.com/auth/callback", false],
  ["EVIL localhost wrong port", "http://localhost:9999/auth/callback", false],
  [
    // Suffix confusion: our host is a prefix of an attacker-registered domain.
    "EVIL lookalike suffix",
    "https://vispeech-pi.vercel.app.evil.com/auth/callback",
    false,
  ],
];

const failures = [];
console.log(
  `${"result".padStart(7)}  ${"case".padEnd(48)} ${"expect".padEnd(7)} landing host`
);
console.log("-".repeat(110));

const errors = [];
let first = true;
for (const [label, redirectTo, expectHonoured] of CASES) {
  if (!first) await sleep(PACE_MS);
  first = false;

  const { host, error, offline } = await landingHost(redirectTo);
  if (offline) {
    // Distinct from a 429: the endpoint was never reached, so there is no
    // verdict to report and nothing to be suspicious about. Skipping keeps
    // this usable from a git hook on a train, but in CI an unreachable
    // endpoint is a real failure and must not pass silently.
    if (STRICT) {
      console.error(`\nFAIL: no network (${error}). STRICT=1 is set.`);
      process.exit(1);
    }
    console.log(`\nSKIP: no network (${error}).`);
    process.exit(0);
  }
  if (error) {
    errors.push([label, error]);
    console.log(
      `${"ERROR".padStart(7)}  ${label.padEnd(48)} ${(expectHonoured ? "allow" : "deny").padEnd(7)} ${error}`
    );
    continue;
  }

  const want = new URL(redirectTo).host;
  const honoured = host === want;
  // A denied case must not only be refused, it must land on the Site URL.
  // Treating "no redirect at all" as a pass would hide a broken oracle.
  const ok = expectHonoured ? honoured : !honoured && host === SITE_URL_HOST;
  if (!ok) failures.push([label, redirectTo, host]);
  console.log(
    `${(ok ? "PASS" : "FAIL").padStart(7)}  ${label.padEnd(48)} ${(expectHonoured ? "allow" : "deny").padEnd(7)} ${host}`
  );
}

console.log();
if (errors.length) {
  console.error(
    "INCONCLUSIVE: some cases could not be probed, so this run proves nothing:"
  );
  for (const [label, error] of errors) console.error(`  - ${label}: ${error}`);
  console.error("\nRe-run in a minute; the endpoint rate-limits.");
  process.exit(1);
}
if (failures.length) {
  console.error("FAILURES:");
  for (const [label, redirectTo, host] of failures) {
    console.error(`  - ${label}: redirect_to=${redirectTo} landed on ${host}`);
  }
  console.error(
    "\nAn allow case failing breaks sign-in for that environment. A deny case\n" +
      "failing is an account-takeover vector: fix it in Supabase immediately."
  );
  process.exit(1);
}
console.log("PASS: the live allow-list behaves correctly.");
console.log("  - every legitimate sign-in host is honoured");
console.log("  - every attacker-controlled host falls back to the Site URL");
