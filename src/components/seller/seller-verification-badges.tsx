"use client";

import { BadgeCheck, Mail, Phone, ShieldCheck } from "lucide-react";
import type { SellerVerification } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

export function SellerVerificationBadges({
  verification,
  className,
}: {
  verification: SellerVerification;
  className?: string;
}) {
  const { t } = useTranslation();

  const items = [
    {
      key: "identity",
      label: t.seller.identityVerified,
      verified: verification.identityVerified,
      icon: ShieldCheck,
    },
    {
      key: "phone",
      label: t.seller.phoneVerified,
      verified: verification.phoneVerified,
      icon: Phone,
    },
    {
      key: "email",
      label: t.seller.emailVerified,
      verified: verification.emailVerified,
      icon: Mail,
    },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span
          key={item.key}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
            item.verified
              ? "bg-brand-50 text-brand-700"
              : "bg-surface-100 text-surface-500"
          )}
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
          {item.verified && <BadgeCheck className="h-3.5 w-3.5 text-brand-600" />}
        </span>
      ))}
    </div>
  );
}
