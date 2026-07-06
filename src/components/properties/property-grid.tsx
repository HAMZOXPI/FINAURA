import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared responsive grid: 1 col mobile, 2 tablet, 4 desktop (8px grid gaps). */
export const PROPERTY_GRID_CLASS =
  "grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4";

export function PropertyGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(PROPERTY_GRID_CLASS, className)}>{children}</div>;
}
