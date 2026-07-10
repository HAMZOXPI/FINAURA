import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertyDetailsSkeleton() {
  return (
    <div className="container-app py-8 lg:py-10">
      <div className="mb-6 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4 text-surface-300" aria-hidden />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="overflow-hidden rounded-[24px]">
        <Skeleton className="aspect-[16/9] w-full sm:aspect-[21/9]" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-24 shrink-0 rounded-xl sm:h-20 sm:w-28" />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-36 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-12 w-56" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-11 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-[24px]" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-[24px]" />
          <Skeleton className="h-80 w-full rounded-[24px]" />
        </div>

        <div className="hidden space-y-6 lg:block">
          <Skeleton className="h-[420px] rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
