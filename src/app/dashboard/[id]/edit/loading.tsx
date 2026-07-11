import { Skeleton } from "@/components/ui/skeleton";

export default function EditPropertyLoading() {
  return (
    <div>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-7 w-52" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
