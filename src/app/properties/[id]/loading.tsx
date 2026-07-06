import { ArrowLeft } from "lucide-react";
import { PropertyDetailGallerySkeleton } from "@/components/properties/property-detail-gallery";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="container-app py-8 lg:py-10">
      <div className="mb-6 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 text-surface-300" />
        <Skeleton className="h-4 w-32" />
      </div>

      <PropertyDetailGallerySkeleton />

      <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-[20px] sm:h-96" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-80 rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
