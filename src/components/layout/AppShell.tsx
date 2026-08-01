"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <div className="flex flex-1">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-[266px] p-0">
            <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
            <Sidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
