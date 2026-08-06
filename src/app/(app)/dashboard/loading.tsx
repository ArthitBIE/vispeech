export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg border border-border bg-card p-4"
          >
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="mt-2 h-6 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Lesson grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-md bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
