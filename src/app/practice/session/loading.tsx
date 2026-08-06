export default function PracticeSessionLoading() {
  return (
    <main className="min-h-screen bg-neutral-50 text-black font-sans">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid min-h-[700px] overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:grid-cols-[230px_1fr_230px]">
          {/* Word list sidebar skeleton */}
          <aside className="border-b border-neutral-200 bg-white p-5 lg:border-b-0 lg:border-r">
            <div className="h-5 w-28 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 animate-pulse rounded-sm bg-neutral-200"
                />
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 w-full animate-pulse rounded bg-neutral-200"
                />
              ))}
            </div>
          </aside>

          {/* Practice card skeleton */}
          <section className="bg-white p-5 lg:p-7">
            <div className="mx-auto max-w-2xl rounded-xl border border-neutral-300 p-6 text-center">
              <div className="mx-auto h-10 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="mx-auto mt-3 h-5 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-44 animate-pulse rounded-lg bg-neutral-200" />
            </div>
          </section>

          {/* Tips sidebar skeleton */}
          <aside className="border-t border-neutral-200 bg-white p-5 lg:border-l lg:border-t-0">
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 rounded-lg border border-neutral-200 p-4">
              <div className="h-4 w-28 animate-pulse rounded bg-neutral-200" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
