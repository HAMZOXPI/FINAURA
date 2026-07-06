"use client";

import { useTranslation } from "@/i18n/locale-provider";

export function PropertiesMapSkeleton() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-[20px] bg-surface-100">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <p className="text-sm text-surface-500">{t.properties.mapLoading}</p>
      </div>
    </div>
  );
}
