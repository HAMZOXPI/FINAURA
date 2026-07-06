"use client";

import type { AdminPropertyDisplayStatus } from "@/lib/admin/property-status";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function AdminPropertyStatusBadge({ status }: { status: AdminPropertyDisplayStatus }) {
  const { t } = useTranslation();

  const config = {
    active: {
      label: t.admin.properties.statusActive,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    pending: {
      label: t.admin.properties.statusPending,
      className: "bg-orange-50 text-orange-700 ring-orange-200",
    },
    rejected: {
      label: t.admin.properties.statusRejected,
      className: "bg-red-50 text-red-700 ring-red-200",
    },
    hidden: {
      label: t.admin.properties.statusHidden,
      className: "bg-surface-100 text-surface-700 ring-surface-200",
    },
    sold: {
      label: t.admin.properties.statusSold,
      className: "bg-blue-50 text-blue-700 ring-blue-200",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
