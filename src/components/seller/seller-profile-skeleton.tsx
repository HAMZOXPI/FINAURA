import { Skeleton } from "@/components/ui/skeleton";

export function SellerProfileSkeleton() {
  return (
    <div className="container-app py-8 lg:py-12">
      <div className="overflow-hidden rounded-[24px] border border-surface-200/80 bg-white">
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="w-full space-y-3 text-center sm:text-start">
              <Skeleton className="mx-auto h-10 w-56 sm:mx-0" />
              <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
              <Skeleton className="mx-auto h-6 w-48 sm:mx-0" />
              <Skeleton className="h-16 w-full max-w-xl" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-surface-100 px-6 py-6 sm:grid-cols-3 lg:grid-cols-5 sm:px-10">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-[20px]" />
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 rounded-[20px]" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}
