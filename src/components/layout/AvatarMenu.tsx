"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

export function AvatarMenu({
  avatarUrl,
  avatarLetter,
}: {
  avatarUrl: string | null;
  avatarLetter: string;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile avatar" />}
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
        <DropdownMenuItem onClick={() => signOutAction()}>
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
