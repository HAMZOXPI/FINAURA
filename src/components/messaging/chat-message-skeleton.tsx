"use client";

import { cn } from "@/lib/utils";

export function ChatMessageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col gap-4 p-5", className)}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={cn("flex gap-3", index % 2 === 0 ? "justify-start" : "justify-end")}
        >
          {index % 2 === 0 && (
            <div className="mt-auto h-8 w-8 shrink-0 animate-pulse rounded-full bg-surface-200" />
          )}
          <div
            className={cn(
              "animate-pulse rounded-[20px] bg-surface-100",
              index % 2 === 0 ? "h-14 w-[58%]" : "h-10 w-[42%] bg-brand-100/70"
            )}
          />
        </div>
      ))}
    </div>
  );
}
