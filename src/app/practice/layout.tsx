import { BareShell } from "@/components/layout/BareShell";
import { verifySession } from "@/lib/auth/dal";

export default async function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proxy only parses the cookie; verify the session for real here.
  await verifySession();

  return <BareShell>{children}</BareShell>;
}
