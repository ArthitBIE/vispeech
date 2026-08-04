import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (user) {
    redirect("/home");
  }
  redirect("/auth/signin");
}
