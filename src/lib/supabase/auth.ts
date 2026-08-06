import { cache } from "react";
import { createServerClient } from "./server";

/**
 * Shared per-request auth lookup. React.cache deduplicates across
 * Header, Sidebar, and page components within the same request,
 * eliminating 2-3 redundant getUser() network round-trips per page load.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
