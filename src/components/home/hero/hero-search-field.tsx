"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSearchFieldProps {
  icon: LucideIcon;
  label: string;
  displayValue: string;
  isFocused?: boolean;
  isComingSoon?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  children: React.ReactNode;
  className?: string;
  fieldId?: string;
}

export function HeroSearchField({
  icon: Icon,
  label,
  displayValue,
  isFocused,
  isComingSoon,
  onFocus,
  onBlur,
  children,
  className,
  fieldId,
}: HeroSearchFieldProps) {
  return (
    <div
      className={cn(
        "group/field relative flex min-h-[4.5rem] flex-1 flex-col justify-center px-4 py-3 transition-all duration-[250ms] sm:min-h-[4.75rem] sm:px-5",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface-50/80",
        isFocused && "bg-brand-50/40 ring-2 ring-inset ring-brand-400/30",
        isComingSoon && "cursor-default opacity-90",
        className
      )}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <label
        htmlFor={fieldId}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-surface-500"
      >
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-[250ms]",
            isFocused
              ? "bg-brand-100 text-brand-700"
              : "bg-surface-100 text-surface-500 group-hover/field:bg-brand-50 group-hover/field:text-brand-600"
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
        </span>
        {label}
      </label>

      {isComingSoon ? (
        <p className="mt-1 text-sm font-semibold text-surface-400">{displayValue}</p>
      ) : (
        <div className="relative mt-1 min-h-[1.75rem]">{children}</div>
      )}
    </div>
  );
}

export function HeroSearchDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hidden h-10 w-px shrink-0 self-center bg-surface-200/90 lg:block",
        className
      )}
      aria-hidden
    />
  );
}
