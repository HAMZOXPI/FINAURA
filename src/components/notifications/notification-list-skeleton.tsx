"use client";

interface NotificationListSkeletonProps {
  count?: number;
  compact?: boolean;
}

export function NotificationListSkeleton({
  count = 3,
  compact = false,
}: NotificationListSkeletonProps) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-3 rounded-xl border border-surface-100 bg-surface-50/50 p-3"
        >
          <div className={compact ? "h-8 w-8 rounded-lg bg-surface-200" : "h-10 w-10 rounded-xl bg-surface-200"} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-surface-200" />
            <div className="h-3 w-full rounded bg-surface-100" />
            {!compact && <div className="h-2.5 w-1/4 rounded bg-surface-100" />}
          </div>
        </div>
      ))}
    </div>
  );
}
