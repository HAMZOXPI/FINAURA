"use client";

import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function VerifiedSellerBadge({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700",
        className
      )}
    >
      <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />
      {t.seller.verifiedSeller}
    </span>
  );
}
