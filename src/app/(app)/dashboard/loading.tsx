export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </div>

      {/* Lesson cards skeleton */}
      <div className="grid gap-4 xl:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="min-h-48 p-6 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-5 w-full max-w-sm animate-pulse rounded-full bg-muted" />
              <div className="mt-4 h-8 w-28 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
