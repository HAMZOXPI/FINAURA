import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-8 grid min-h-[620px] gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Skeleton className="min-h-[520px] rounded-[24px]" />
        <Skeleton className="min-h-[520px] rounded-[24px]" />
      </div>
    </div>
  );
}
