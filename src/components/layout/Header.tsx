"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TitleLogo from "@/components/layout/TitleLogo";
import { supabase } from "@/lib/supabase/client";

export function Header({
  alignToContent = false,
}: {
  alignToContent?: boolean;
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLetter, setAvatarLetter] = useState("ก");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const user = data.session?.user;
      const email = user?.email;
      if (email) setAvatarLetter(email[0].toUpperCase());
      const url =
        (user?.user_metadata?.avatar_url as string | undefined) ||
        (user?.user_metadata?.picture as string | undefined);
      if (url) setAvatarUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} alt="Profile avatar" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {avatarLetter}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                โปรไฟล์
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/auth/signin");
                }}
              >
                ออกจากระบบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
