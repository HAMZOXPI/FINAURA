import { PropertyGridSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-app py-10">
      <div className="mb-8 h-10 w-48 animate-pulse rounded-xl bg-surface-200" />
      <PropertyGridSkeleton count={8} />
    </div>
  );
}
