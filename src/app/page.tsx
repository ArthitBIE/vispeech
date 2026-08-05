import { redirect } from "next/navigation";

// The proxy (src/proxy.ts) already gates unauthenticated users to
// /auth/signin and redirects authenticated users away from /auth/*.
// Only authenticated users reach this page, so no auth check needed.
export default async function RootPage() {
  redirect("/home");
}
