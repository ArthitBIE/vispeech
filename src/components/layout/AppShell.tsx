import { Suspense } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

function SidebarFallback() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[266px] shrink-0 animate-pulse bg-background lg:block" />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1">
        <Suspense fallback={<SidebarFallback />}>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </Suspense>

        <MobileNav />

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
