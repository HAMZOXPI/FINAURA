export function AdminNotificationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-72 rounded-lg bg-surface-200" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-surface-200" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-surface-200" />
    </div>
  );
}
