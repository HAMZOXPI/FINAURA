import { Skeleton } from "@/components/ui/skeleton";

export function SellerProfileSkeleton() {
  return (
    <div className="container-app py-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <div className="overflow-hidden rounded-[28px] border border-surface-200/80 bg-white p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="w-full space-y-3 text-center sm:text-start">
                <Skeleton className="mx-auto h-10 w-64 sm:mx-0" />
                <Skeleton className="mx-auto h-5 w-40 sm:mx-0" />
                <Skeleton className="mx-auto h-4 w-56 sm:mx-0" />
                <Skeleton className="mx-auto h-6 w-48 sm:mx-0" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-36 rounded-full" />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-[20px]" />
            ))}
          </div>

          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-40 rounded-[24px]" />
          <Skeleton className="h-56 rounded-[24px]" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-[280px] shrink-0 rounded-[20px]" />
              ))}
            </div>
          </div>

          <Skeleton className="h-72 rounded-[24px]" />
          <Skeleton className="h-48 rounded-[24px]" />
          <Skeleton className="h-64 rounded-[24px]" />
        </div>

        <div className="hidden space-y-6 lg:block">
          <Skeleton className="h-80 rounded-[24px]" />
          <Skeleton className="h-56 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
