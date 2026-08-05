export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-xl border border-border bg-card p-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-muted" />
        </div>

        {/* Streak card skeleton */}
        <section className="mb-7 max-w-3xl rounded-xl border border-orange-300 bg-card p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-5 w-full animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </section>

        {/* Lesson cards skeleton */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="mb-4 h-32 animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
