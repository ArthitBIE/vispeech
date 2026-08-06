export default function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 h-14 border-b border-border bg-background" />

      <div className="flex flex-1">
        {/* Sidebar skeleton */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[266px] shrink-0 animate-pulse border-r border-border bg-background lg:block">
          <div className="space-y-3 p-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-muted/50" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
