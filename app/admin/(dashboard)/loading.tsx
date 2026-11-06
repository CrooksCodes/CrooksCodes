export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <span className="sr-only" role="status">Loading…</span>
      <div className="flex flex-col gap-2">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-64 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface px-4 py-3">
            <div className="h-3 w-16 animate-pulse rounded bg-surface-2" />
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-lg border border-border bg-surface" />
    </div>
  );
}
