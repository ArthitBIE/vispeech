/**
 * Parsing for the Supabase auth session cookie written by `@supabase/ssr`.
 *
 * The cookie is NOT a bare JWT. `@supabase/ssr` stores the whole session object
 * and encodes it as `base64-<base64url JSON>`, then splits it across
 * `sb-<ref>-auth-token.0`, `.1`, ... when it exceeds the ~4KB cookie limit.
 *
 * Reading only `sb-<ref>-auth-token` and treating it as a JWT therefore never
 * matches a real Google OAuth session, which silently logs users straight back
 * out after a successful sign-in.
 */

export type SessionCookie = { name: string; value: string };

/** Decode the `sub` (user id) claim from a JWT without verifying the signature. */
export function decodeJwtSub(jwt: string): string | null {
  try {
    const part = jwt.split(".")[1];
    if (!part) return null;
    const payload = JSON.parse(
      atob(part.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return typeof payload?.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the signed-in user id from request cookies.
 *
 * Presence check only — the signature is not verified here, so treat the result
 * as routing intent rather than proof of authorization. Data access is still
 * guarded by Supabase RLS and per-request server clients.
 */
export function getUserIdFromCookies(
  cookies: readonly SessionCookie[]
): string | null {
  const groups = new Map<string, { index: number; value: string }[]>();

  for (const { name, value } of cookies) {
    if (!value) continue;

    const match = name.match(/^(.*-auth-token)(?:\.(\d+))?$/);
    if (!match) continue;

    const [, base, indexPart] = match;
    const list = groups.get(base) ?? [];
    list.push({ index: indexPart ? Number(indexPart) : 0, value });
    groups.set(base, list);
  }

  for (const parts of groups.values()) {
    const raw = parts
      .sort((a, b) => a.index - b.index)
      .map((p) => p.value)
      .join("");

    // Form 1: `base64-<base64url JSON session>` (what @supabase/ssr writes).
    if (raw.startsWith("base64-")) {
      try {
        const json = atob(
          raw.slice("base64-".length).replace(/-/g, "+").replace(/_/g, "/")
        );
        const sub = decodeJwtSub(JSON.parse(json)?.access_token ?? "");
        if (sub) return sub;
      } catch {
        // malformed or partial chunk set — treat as unauthenticated
      }
      continue;
    }

    // Form 2: plain JSON session object.
    if (raw.startsWith("{")) {
      try {
        const sub = decodeJwtSub(JSON.parse(raw)?.access_token ?? "");
        if (sub) return sub;
      } catch {
        // fall through
      }
      continue;
    }

    // Form 3: bare JWT (older clients).
    const sub = decodeJwtSub(raw);
    if (sub) return sub;
  }

  return null;
}
