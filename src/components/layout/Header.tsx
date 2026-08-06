import Link from "next/link";
import { getSupabaseUser } from "@/lib/supabase/server";
import TitleLogo from "@/components/layout/TitleLogo";
import { AvatarMenu } from "./AvatarMenu";
import { MobileNav } from "./MobileNav";

export async function Header({
  alignToContent = false,
}: {
  alignToContent?: boolean;
}) {
  let avatarLetter = "ก";
  let avatarUrl: string | null = null;

  const { user } = await getSupabaseUser();
  if (user?.email) {
    avatarLetter = user.email[0].toUpperCase();
  }
  avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined) ||
    null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div
        className={`mx-auto flex h-14 items-center justify-between ${
          alignToContent ? "w-full max-w-7xl px-3 lg:px-4" : "px-5"
        }`}
      >
        <Link href="/" aria-label="Vispeech home" className="flex-shrink-0">
          <TitleLogo />
        </Link>

        <div className="flex items-center gap-2">
          <MobileNav />
          <AvatarMenu avatarUrl={avatarUrl} avatarLetter={avatarLetter} />
        </div>
      </div>
    </header>
  );
}
