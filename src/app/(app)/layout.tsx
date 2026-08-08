import { AppShell } from "@/components/layout/AppShell";
import { verifySession } from "@/lib/auth/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy's cookie check is optimistic: it parses the session cookie but
  // never verifies the signature or expiry, so a forged or stale cookie gets
  // past it. Verify for real before rendering anything under this layout.
  await verifySession();

  return <AppShell>{children}</AppShell>;
}
