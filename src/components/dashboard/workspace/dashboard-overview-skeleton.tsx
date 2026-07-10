export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-72 max-w-full rounded-lg bg-surface-200" />
          <div className="h-4 w-96 max-w-full rounded bg-surface-200" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-7 w-32 rounded-full bg-surface-200" />
          <div className="h-4 w-40 rounded bg-surface-200" />
        </div>
      </div>

      <div className="h-44 rounded-3xl bg-surface-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-surface-200" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-surface-200" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-2xl bg-surface-200" />
        <div className="h-80 rounded-2xl bg-surface-200" />
      </div>

      <div className="h-72 rounded-2xl bg-surface-200" />
    </div>
  );
}
