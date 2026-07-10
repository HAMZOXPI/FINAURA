"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumSectionCrownIconProps {
  className?: string;
}

export function PremiumSectionCrownIcon({ className }: PremiumSectionCrownIconProps) {
  return (
    <span
      className={cn(
        "group/crown relative inline-flex h-14 w-14 shrink-0 sm:h-16 sm:w-16",
        className
      )}
      aria-hidden
    >
      {/* Soft golden glow */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full",
          "bg-[radial-gradient(circle,rgba(245,158,11,0.45)_0%,rgba(255,214,107,0.15)_45%,transparent_70%)]",
          "blur-md transition-all duration-[250ms] ease-out",
          "group-hover/crown:scale-[1.18] group-hover/crown:opacity-100"
        )}
      />

      {/* Outer soft ring + luxury elevation */}
      <span
        className={cn(
          "relative flex h-full w-full items-center justify-center rounded-full",
          "ring-2 ring-amber-200/45 ring-offset-2 ring-offset-white/80",
          "shadow-[0_4px_18px_rgba(201,122,0,0.28),0_10px_36px_rgba(245,158,11,0.22),0_0_48px_rgba(255,214,107,0.18)]",
          "transition-all duration-[250ms] ease-out",
          "group-hover/crown:scale-105",
          "group-hover/crown:ring-amber-300/60",
          "group-hover/crown:shadow-[0_6px_24px_rgba(201,122,0,0.38),0_14px_44px_rgba(245,158,11,0.32),0_0_64px_rgba(255,214,107,0.32)]"
        )}
      >
        {/* Premium gradient badge with inner ring + radial highlight */}
        <span
          className={cn(
            "relative flex h-[calc(100%-4px)] w-[calc(100%-4px)] items-center justify-center overflow-hidden rounded-full",
            "bg-gradient-to-br from-[#FFD66B] via-[#F59E0B] to-[#C97A00]",
            "ring-1 ring-inset ring-white/35",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(201,122,0,0.25)]"
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute inset-0",
              "bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0.08)_38%,transparent_62%)]"
            )}
          />

          <Crown
            className={cn(
              "relative z-[1] h-[42px] w-[42px] sm:h-12 sm:w-12",
              "fill-amber-950/25 text-amber-950",
              "drop-shadow-[0_1px_2px_rgba(120,53,15,0.35)]",
              "transition-transform duration-[250ms] ease-out",
              "group-hover/crown:rotate-[2.5deg]"
            )}
            strokeWidth={2.5}
          />
        </span>
      </span>
    </span>
  );
}
