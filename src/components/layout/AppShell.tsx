import { Suspense } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-30 h-14 border-b border-border bg-background" />
  );
}

function SidebarSkeleton() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[266px] shrink-0 animate-pulse border-r border-border bg-background lg:block">
      <div className="space-y-3 p-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      <div className="flex flex-1">
        <Suspense fallback={<SidebarSkeleton />}>
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
