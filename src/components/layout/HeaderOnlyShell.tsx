import type { ReactNode } from "react";
import { Header } from "./Header";

export function HeaderOnlyShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header alignToContent />
      <main className="min-w-0 flex-1 px-3 py-6 lg:px-4">{children}</main>
    </div>
  );
}
