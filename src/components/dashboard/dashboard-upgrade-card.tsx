"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

interface DashboardUpgradeCardProps {
  isPremium: boolean;
}

export function DashboardUpgradeCard({ isPremium }: DashboardUpgradeCardProps) {
  const { t } = useTranslation();

  if (isPremium) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        <Check className="h-4 w-4" />
        {t.dashboard.premiumActive}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="mb-1 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-brand-600" />
        <p className="text-sm font-bold text-surface-900">{t.dashboard.upgradeTitle}</p>
      </div>
      <p className="text-xs leading-relaxed text-surface-600">{t.dashboard.upgradeDescription}</p>
      <Button href="/pricing" size="sm" className="mt-3 w-full">
        {t.dashboard.upgradeCta}
      </Button>
    </div>
  );
}
