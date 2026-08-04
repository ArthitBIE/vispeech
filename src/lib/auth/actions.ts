"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/auth/signin");
}
