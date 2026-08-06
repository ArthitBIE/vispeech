import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "https://placeholder.supabase.co"
  ) {
    console.warn(
      "Supabase env vars not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null as any;
  }

  const cookieStore = await cookies();

  return createSsrServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only; safe to ignore.
        }
      },
    },
  });
}

/**
 * Cached Supabase client + user for a single server render pass.
 * React.cache() deduplicates across Header, Sidebar, and page components
 * so auth is called once per request instead of three times.
 */
export const getSupabaseUser = cache(
  async (): Promise<{
    supabase: Awaited<ReturnType<typeof createServerClient>>;
    user: User | null;
  }> => {
    const supabase = await createServerClient();
    if (!supabase) return { supabase: null, user: null };
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  }
);
