import { HeaderOnlyShell } from "@/components/layout/HeaderOnlyShell";
import { verifySession } from "@/lib/auth/dal";

export default async function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Proxy only parses the cookie; verify the session for real here.
  await verifySession();

  return <HeaderOnlyShell>{children}</HeaderOnlyShell>;
}
