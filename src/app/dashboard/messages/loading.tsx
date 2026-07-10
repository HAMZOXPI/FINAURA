import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8 grid min-h-[680px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <Skeleton className="min-h-[620px] rounded-[24px]" />
        <Skeleton className="min-h-[620px] rounded-[24px]" />
        <Skeleton className="hidden min-h-[620px] rounded-[24px] xl:block" />
      </div>
    </div>
  );
}
