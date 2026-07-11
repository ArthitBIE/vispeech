// Safe Supabase auth diagnostic.
// Loads .env.local, fails fast on missing required vars, NEVER logs secrets.
// Reports only: env presence, Supabase hostname, HTTP status, redacted response.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && value && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local optional; process.env may already be populated
  }
}

function redact(value) {
  if (value === undefined || value === null) return "<unset>";
  const s = String(value);
  if (s.length === 0) return "<empty>";
  return `${s.slice(0, 4)}…(len=${s.length})`;
}

function redactEmail(email) {
  if (!email) return "<unset>";
  const [user, domain] = String(email).split("@");
  if (!domain) return "<redacted-email>";
  return `${user.slice(0, 1)}***@${domain}`;
}

function redactResponse(body, email) {
  // Mask the test email and any jwt-shaped tokens in the response text.
  let out = body;
  if (email) out = out.split(email).join("<TEST_EMAIL>");
  // jwt-ish: three dot-separated base64url segments
  out = out.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "<TOKEN>");
  return out;
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  console.log("=== Supabase auth diagnostic ===");
  console.log("NEXT_PUBLIC_SUPABASE_URL   present:", Boolean(supabaseUrl));
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY present:", Boolean(anonKey));
  console.log("E2E_TEST_EMAIL            present:", Boolean(email));
  console.log("E2E_TEST_PASSWORD         present:", Boolean(password));
  if (supabaseUrl) {
    try {
      console.log("Supabase hostname:", new URL(supabaseUrl).hostname);
    } catch {
      console.log("Supabase URL invalid:", redact(supabaseUrl));
    }
  }

  // Fail fast on missing required vars
  const missing = [];
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!email) missing.push("E2E_TEST_EMAIL");
  if (!password) missing.push("E2E_TEST_PASSWORD");
  if (missing.length) {
    console.error("Missing required env vars:", missing.join(", "));
    process.exit(1);
  }

  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`;
  console.log("\nPOST", url.replace(anonKey, "<ANON_KEY>"));
  console.log("apikey:", redact(anonKey));
  console.log("email:", redactEmail(email));

  let status = null;
  let raw = "";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    status = res.status;
    raw = await res.text();
  } catch (err) {
    console.log("\nRESULT: NO RESPONSE (local env / network issue)");
    console.log("Error:", err.message);
    console.log("\nClassification: local env or network problem — not a Supabase Auth 500.");
    process.exit(0);
  }

  console.log("\nHTTP status:", status);
  console.log("Redacted body:", redactResponse(raw, email));

  if (status === 400) {
    console.log("\nClassification: 400 = credentials / user issue (wrong password, unconfirmed email, or user missing).");
  } else if (status === 500) {
    console.log("\nClassification: 500 = Supabase project / Auth / database issue (e.g. paused free-tier project, Auth server error). Outside the frontend.");
  } else if (status === 200) {
    console.log("\nClassification: 200 = auth succeeded. The frontend code path is correct; original 500 was transient.");
  } else {
    console.log("\nClassification: unexpected status — review redacted body above.");
  }
}

main();
