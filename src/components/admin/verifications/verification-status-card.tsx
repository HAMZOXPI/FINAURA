"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationStatusCardProps {
  icon: LucideIcon;
  title: string;
  status: string;
  description?: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "pending";
  unavailable?: boolean;
}

export function VerificationStatusCard({
  icon: Icon,
  title,
  status,
  description,
  tone = "neutral",
  unavailable,
}: VerificationStatusCardProps) {
  const toneClasses = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
    danger: "bg-red-50 text-red-700 ring-red-200/80",
    pending: "bg-orange-50 text-orange-700 ring-orange-200/80",
    neutral: "bg-surface-100 text-surface-600 ring-surface-200/80",
  }[tone];

  return (
    <div className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white px-3.5 py-3 shadow-sm transition-shadow hover:shadow-md">
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : unavailable ? (
        <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
      ) : (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-surface-500" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-surface-900">{title}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
              toneClasses
            )}
          >
            {status}
          </span>
        </div>
        {description && <p className="mt-0.5 text-xs text-surface-500">{description}</p>}
      </div>
    </div>
  );
}
