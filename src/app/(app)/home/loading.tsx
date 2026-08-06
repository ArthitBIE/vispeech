export default function HomeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Banner skeleton */}
      <div className="h-24 rounded-lg bg-muted/50" />

      {/* Search + filter skeleton */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 rounded-md bg-muted" />
        <div className="h-10 w-20 rounded-md bg-muted" />
      </div>

      {/* Lesson card grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
