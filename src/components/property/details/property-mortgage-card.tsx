"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import type { Property } from "@/types/database";
import {
  calculateMonthlyMortgage,
  formatMortgageAmount,
} from "@/lib/property/details-display";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyMortgageCardProps {
  property: Property;
}

export function PropertyMortgageCard({ property }: PropertyMortgageCardProps) {
  const { t, locale } = useTranslation();
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [years, setYears] = useState(20);

  const downPayment = useMemo(
    () => Math.round(property.price * (downPaymentPercent / 100)),
    [property.price, downPaymentPercent]
  );

  const monthlyPayment = useMemo(
    () => calculateMonthlyMortgage(property.price, downPayment, years),
    [property.price, downPayment, years]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Calculator className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900">{t.propertyDetail.mortgageTitle}</h3>
          <p className="text-xs text-surface-500">{t.propertyDetail.mortgageSubtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            {t.propertyDetail.mortgagePrice}
          </label>
          <p className="mt-1 text-sm font-bold text-surface-900" dir={locale === "ar" ? "ltr" : undefined}>
            {formatMortgageAmount(property.price, locale)} DH
          </p>
        </div>

        <div>
          <label htmlFor="mortgage-down" className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            {t.propertyDetail.mortgageDownPayment} ({downPaymentPercent}%)
          </label>
          <input
            id="mortgage-down"
            type="range"
            min={0}
            max={50}
            step={5}
            value={downPaymentPercent}
            onChange={(event) => setDownPaymentPercent(Number(event.target.value))}
            className="mt-2 w-full accent-brand-600"
            aria-valuemin={0}
            aria-valuemax={50}
            aria-valuenow={downPaymentPercent}
          />
          <p className="mt-1 text-xs text-surface-500" dir={locale === "ar" ? "ltr" : undefined}>
            {formatMortgageAmount(downPayment, locale)} DH
          </p>
        </div>

        <div>
          <label htmlFor="mortgage-years" className="text-xs font-semibold uppercase tracking-wide text-surface-500">
            {t.propertyDetail.mortgageYears}
          </label>
          <Input
            id="mortgage-years"
            type="number"
            min={5}
            max={30}
            value={years}
            onChange={(event) => setYears(Math.max(5, Math.min(30, Number(event.target.value) || 20)))}
            className="mt-2 h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t.propertyDetail.mortgageMonthly}
        </p>
        <p
          className="mt-1 text-2xl font-bold text-brand-900"
          dir={locale === "ar" ? "ltr" : undefined}
        >
          {formatMortgageAmount(monthlyPayment, locale)} DH
          <span className="text-sm font-medium text-brand-700">
            {locale === "ar" ? "/شهر" : "/mois"}
          </span>
        </p>
        <p className="mt-2 text-[11px] text-brand-700/70">{t.propertyDetail.mortgageDisclaimer}</p>
      </div>
    </motion.div>
  );
}
