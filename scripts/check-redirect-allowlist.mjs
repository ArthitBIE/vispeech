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

if (!token || !ref) {
  console.log(
    "SKIP: SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF not set. " +
      "This check is intended for maintainers with project access."
  );
  process.exit(0);
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/config/auth`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      // The default agent string trips Cloudflare with "error code: 1010".
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  }
);

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
// Bare wildcard in the host position, e.g. https://*.vercel.app
const bare = live.filter((e) => /^https?:\/\/\*\./.test(e));

let failed = false;

if (bare.length) {
  console.error(
    "FAIL: bare wildcard entr(ies) present, account-takeover risk:"
  );
  bare.forEach((e) => console.error("  " + e));
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
