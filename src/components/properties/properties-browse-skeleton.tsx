import { PropertyCardSkeleton } from "@/components/ui/skeleton";

export function PropertiesBrowseSkeleton() {
  return (
    <div className="bg-surface-50/60">
      <div className="border-b border-surface-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="container-app space-y-3 py-10 lg:py-12">
          <div className="h-4 w-20 animate-pulse rounded bg-surface-200" />
          <div className="h-10 w-64 animate-pulse rounded-xl bg-surface-200" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded-lg bg-surface-200" />
          <div className="h-9 w-40 animate-pulse rounded-full bg-surface-200" />
        </div>
      </div>

      <div className="container-app py-8 lg:py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden h-[640px] w-72 shrink-0 animate-pulse rounded-[20px] bg-surface-200 lg:block" />
          <div className="min-w-0 flex-1">
            <div className="mb-6 h-16 animate-pulse rounded-[20px] bg-surface-200" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
