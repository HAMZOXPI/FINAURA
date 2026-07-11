import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSettingsLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-8 max-w-lg space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-5 w-1/3" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-2/3 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
