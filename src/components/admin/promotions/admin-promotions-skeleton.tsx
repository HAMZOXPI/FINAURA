export function AdminPromotionsSkeleton() {
  return (
    <div className="space-y-12 pb-12 animate-pulse">
      <div className="space-y-5">
        <div className="h-6 w-24 rounded-full bg-surface-200" />
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-surface-200" />
          <div className="flex-1 space-y-3">
            <div className="h-10 w-80 max-w-full rounded-xl bg-surface-200" />
            <div className="h-5 w-96 max-w-full rounded-lg bg-surface-100" />
          </div>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-full bg-surface-100" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-surface-200/80" />
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <div className="h-[720px] rounded-2xl bg-surface-200/80" />
        </div>
        <div className="h-96 rounded-2xl bg-surface-100 xl:col-span-2" />
      </div>

      <div className="h-[480px] rounded-2xl bg-surface-200/80" />
    </div>
  );
}
