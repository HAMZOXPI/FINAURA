import { Skeleton, PropertyGridSkeleton } from "@/components/ui/skeleton";

export default function DashboardFavoritesLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-8">
        <PropertyGridSkeleton count={4} />
      </div>
    </div>
  );
}
