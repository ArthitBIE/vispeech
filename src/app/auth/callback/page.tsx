import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  if (params.error) {
    const msg = params.error_description || params.error;
    redirect(`/auth/signin?error=${encodeURIComponent(msg)}`);
  }

  const supabase = await createServerClient();
  if (!supabase) {
    redirect("/auth/signin?error=Supabase not configured");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect(
      "/auth/signin?error=" +
        encodeURIComponent("Session not found after OAuth")
    );
  }
}
