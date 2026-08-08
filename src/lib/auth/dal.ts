import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseUser } from "@/lib/supabase/server";

/**
 * Data Access Layer session check.
 *
 * `src/proxy.ts` only *parses* the session cookie. It never verifies the JWT
 * signature or the expiry, because that is a network call and Proxy runs on
 * every request. That makes the proxy an optimistic redirect, not an
 * authorization boundary: anyone can hand-craft
 *
 *   Cookie: sb-x-auth-token=base64-<{"access_token":"<unsigned jwt>"}>
 *
 * and the proxy will wave them through. Verified by hand against a running dev
 * server: a forged cookie returned 200 on /dashboard and /settings, and a
 * session with `exp` in the year 2001 did too.
 *
 * This function closes that hole. `supabase.auth.getUser()` sends the token to
 * Supabase, which validates the signature and the expiry server-side, so a
 * forged or stale token resolves to `null` and we redirect. Next.js's own
 * authentication guide makes the same split: proxy for optimistic checks,
 * a DAL for the real one, as close to the data as possible.
 *
 * Wrapped in `React.cache` so the layout, the page, and the sidebar share one
 * verification per render pass rather than three round-trips.
 */
export const verifySession = cache(async (): Promise<User> => {
  const { user } = await getSupabaseUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
});
