import { redirect } from "next/navigation";
import { getSupabaseUser } from "@/lib/supabase/server";

export default async function RootPage() {
  const { user } = await getSupabaseUser();

  if (user) {
    redirect("/home");
  }
  redirect("/auth/signin");
}
