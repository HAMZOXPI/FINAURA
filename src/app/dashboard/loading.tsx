import { DashboardStatsSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-200" />
      <div className="mt-8">
        <DashboardStatsSkeleton />
      </div>
    </div>
  );
}
