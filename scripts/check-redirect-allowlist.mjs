/**
 * Compares the live Supabase redirect allow-list against the entries recorded
 * in docs/CONFIGURATION.md, and fails if they drift apart.
 *
 * The allow-list lives only in Supabase project config -- it is not in this
 * repo and no migration recreates it. The docs are therefore the only tracked
 * record of it, which is worth nothing if they silently go stale. This also
 * fails on a bare `https://*.vercel.app` entry, which is an account-takeover
 * vector (see docs/CONFIGURATION.md).
 *
 * Usage: node scripts/check-redirect-allowlist.mjs
 * Requires SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF.
 */
import { readFileSync } from "node:fs";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

// Skipping is right on a contributor's laptop and wrong in CI: a scheduled
// job whose secrets were never configured would report green forever while
// checking nothing. STRICT=1 turns the skip into a failure.
const STRICT = process.env.STRICT === "1";

if (!token || !ref) {
  const msg =
    "SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF not set. " +
    "This check is intended for maintainers with project access.";
  if (STRICT) {
    console.error(`FAIL: ${msg}\nSTRICT=1 is set, so this is an error.`);
    process.exit(1);
  }
  console.log(`SKIP: ${msg}`);
  process.exit(0);
}

let res;
try {
  res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
    headers: {
      Authorization: `Bearer ${token}`,
      // The default agent string trips Cloudflare with "error code: 1010".
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
} catch (err) {
  // Unreachable network is not evidence of a misconfiguration. This runs in a
  // git hook, so failing closed here would block an offline commit for a
  // reason that has nothing to do with the change being made.
  if (STRICT) {
    console.error(
      `FAIL: cannot reach the Management API (${err.message}). STRICT=1 is set.`
    );
    process.exit(1);
  }
  console.log(`SKIP: cannot reach the Management API (${err.message}).`);
  process.exit(0);
}

if (!res.ok) {
  console.error(`FAIL: Management API returned ${res.status}`);
  process.exit(1);
}

const cfg = await res.json();
const live = (cfg.uri_allow_list ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .sort();

const doc = readFileSync("docs/CONFIGURATION.md", "utf8");
const start = doc.indexOf("### Current allow-list entries");
const end = doc.indexOf("\n### ", start + 10);
const section = doc.slice(start, end);
const documented = [
  ...new Set(
    [...section.matchAll(/```([\s\S]*?)```/g)]
      .flatMap((m) => m[1].split("\n"))
      .map((l) => l.trim())
      .filter((l) => l.startsWith("http://") || l.startsWith("https://"))
  ),
].sort();

const onlyLive = live.filter((e) => !documented.includes(e));
const onlyDoc = documented.filter((e) => !live.includes(e));
// Any wildcard in the HOST position, e.g. https://*.vercel.app or
// https://app-*-team.vercel.app. Anchoring the wildcard to a project-and-team
// prefix looks safe but is not: vercel.app project hosts are one flat,
// first-come namespace and a project name is free text, so an outsider can
// register a name that matches the pattern without crossing a dot. A `*` in
// the path (https://exact.host/**) is fine and is not flagged.
const hostWildcard = live.filter((e) =>
  e
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .includes("*")
);

// The Site URL was previously printed but never asserted, so when it changed
// this check still reported OK and the failure surfaced two steps later in
// check-redirect-behaviour.mjs as six alarming-looking deny failures. That is
// a misleading place to learn about a config edit, so compare it here where
// the diagnosis is obvious.
const docSiteUrl = doc.match(/^Site URL is `([^`]+)`\./m)?.[1];
const liveSiteUrl = cfg.site_url;

let failed = false;

if (!docSiteUrl) {
  console.error(
    "FAIL: could not find the Site URL line in docs/CONFIGURATION.md.\n" +
      "Expected a line of the form: Site URL is `https://...`."
  );
  failed = true;
} else if (docSiteUrl.replace(/\/+$/, "") !== liveSiteUrl.replace(/\/+$/, "")) {
  console.error("FAIL: Site URL has drifted from docs/CONFIGURATION.md:");
  console.error(`  documented: ${docSiteUrl}`);
  console.error(`  live:       ${liveSiteUrl}`);
  console.error(
    "\nThe Site URL is the fallback for any redirect_to that is not\n" +
      "allow-listed. Changing it is not itself a security problem, but it\n" +
      "must stay in step with SITE_URL_HOST in check-redirect-behaviour.mjs,\n" +
      "or every deny case in that script will fail for the wrong reason."
  );
  failed = true;
}

if (hostWildcard.length) {
  console.error("FAIL: wildcard in host position, account-takeover risk:");
  hostWildcard.forEach((e) => console.error("  " + e));
  failed = true;
}
if (onlyLive.length) {
  console.error("FAIL: live entries missing from docs/CONFIGURATION.md:");
  onlyLive.forEach((e) => console.error("  " + e));
  failed = true;
}
if (onlyDoc.length) {
  console.error("FAIL: documented entries no longer live:");
  onlyDoc.forEach((e) => console.error("  " + e));
  failed = true;
}

if (failed) {
  console.error(
    "\nUpdate docs/CONFIGURATION.md or the Supabase config so they agree."
  );
  process.exit(1);
}

console.log(
  `OK: ${live.length} allow-list entries match docs/CONFIGURATION.md`
);
console.log(`    site_url: ${cfg.site_url}`);
