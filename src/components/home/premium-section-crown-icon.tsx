"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface PremiumSectionCrownIconProps {
  className?: string;
}

export function PremiumSectionCrownIcon({ className }: PremiumSectionCrownIconProps) {
  return (
    <span
      className={cn(
        "premium-crown-float group/crown relative inline-flex flex-col items-center",
        className
      )}
      aria-hidden
    >
      <span className="relative inline-flex h-[3.85rem] w-[3.85rem] shrink-0 items-center justify-center sm:h-[4.4rem] sm:w-[4.4rem]">
        {/* Soft radial golden light behind the badge */}
        <span
          className="pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.2)_0%,rgba(245,158,11,0.07)_45%,transparent_72%)] blur-xl"
          aria-hidden
        />

        {/* Subtle blue shadow underneath */}
        <span
          className="pointer-events-none absolute -bottom-1.5 left-1/2 h-3.5 w-[72%] -translate-x-1/2 rounded-full bg-brand-600/10 blur-md"
          aria-hidden
        />

        {/* Soft gold outer glow */}
        <span
          className={cn(
            "pointer-events-none absolute -inset-1.5 rounded-full",
            "bg-[radial-gradient(circle,rgba(245,158,11,0.32)_0%,rgba(255,214,107,0.1)_48%,transparent_76%)]",
            "blur-[3px] transition-all duration-300 ease-out",
            "group-hover/crown:blur-md group-hover/crown:opacity-100"
          )}
          aria-hidden
        />

        {/* Layered premium badge — white center with gold ring */}
        <span
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white",
            "shadow-[0_2px_6px_rgba(15,23,42,0.06),0_6px_20px_rgba(0,105,198,0.1),0_4px_14px_rgba(245,158,11,0.16)]",
            "ring-1 ring-amber-300/50",
            "transition-all duration-300 ease-out",
            "group-hover/crown:ring-amber-400/60",
            "group-hover/crown:shadow-[0_3px_10px_rgba(15,23,42,0.08),0_10px_28px_rgba(0,105,198,0.14),0_6px_18px_rgba(245,158,11,0.24)]"
          )}
        >
          {/* Thin gold inner ring */}
          <span
            className="pointer-events-none absolute inset-[5px] rounded-full ring-[1.5px] ring-inset ring-amber-400/40"
            aria-hidden
          />

          {/* Premium glass highlight — upper-left */}
          <span
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full",
              "bg-[radial-gradient(ellipse_at_26%_20%,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.28)_24%,transparent_52%)]"
            )}
            aria-hidden
          />

          {/* Subtle depth on upper edge */}
          <span
            className="pointer-events-none absolute inset-x-3 top-[4px] h-[36%] rounded-full bg-gradient-to-b from-white/70 to-transparent"
            aria-hidden
          />

          <Image
            src="/crown.png"
            alt=""
            width={64}
            height={64}
            className={cn(
              "relative z-[1] h-14 w-14 object-contain sm:h-16 sm:w-16",
              "transition-transform duration-300 ease-out",
              "group-hover/crown:rotate-[2.5deg]"
            )}
            aria-hidden
          />
        </span>
      </span>

      {/* Gold accent line — centered under the badge */}
      <span
        className={cn(
          "mt-3.5 h-px w-[4.75rem] rounded-full sm:w-20",
          "bg-gradient-to-r from-transparent via-amber-400/85 to-transparent",
          "shadow-[0_0_8px_rgba(251,191,36,0.28)]"
        )}
        aria-hidden
      />
    </span>
  );
}
