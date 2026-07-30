import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = createServerClient();
  const session = supabase
    ? (await supabase.auth.getSession()).data.session
    : null;

  if (session) {
    redirect("/home");
  }
  redirect("/home");
}
