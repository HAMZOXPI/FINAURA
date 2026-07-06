"use client";



import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { CheckCircle2, Gift, History, X, XCircle } from "lucide-react";

import type { AdminGiftPaymentSource, AdminGiftStatus, AdminGiftType } from "@/types/database";

import type { Locale } from "@/i18n/config";

import { ConfettiBurst } from "@/components/admin/promotions/promotion-ui";

import { cn, formatDate } from "@/lib/utils";

import { useTranslation } from "@/i18n/locale-provider";



export type ToastState = { type: "success" | "error"; message: string } | null;



export function AdminPromotionToast({

  toast,

  onClose,

}: {

  toast: ToastState;

  onClose: () => void;

}) {

  const { t } = useTranslation();
  const [confetti, setConfetti] = useState(false);



  useEffect(() => {

    if (!toast) return;

    if (toast.type === "success") setConfetti(true);

    const timer = window.setTimeout(onClose, 5000);

    return () => window.clearTimeout(timer);

  }, [toast, onClose]);



  if (!toast) return null;

  return (
    <>
      <ConfettiBurst active={confetti} />
      <AnimatePresence>
        <motion.div
          key={toast.message}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-6 end-6 z-[100] flex max-w-md items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-sm",
            toast.type === "success"
              ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950"
              : "border-red-200/80 bg-red-50/95 text-red-950"
          )}
        >

        <div

          className={cn(

            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",

            toast.type === "success" ? "bg-emerald-100" : "bg-red-100"

          )}

        >

          {toast.type === "success" ? (

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

          ) : (

            <XCircle className="h-5 w-5 text-red-600" />

          )}

        </div>

        <div className="min-w-0 flex-1">

          <p className="text-sm font-semibold">

            {toast.type === "success" ? t.admin.promotions.toastSuccess : t.admin.promotions.toastError}

          </p>

          <p className="mt-0.5 text-sm opacity-90">{toast.message}</p>

        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={t.admin.promotions.close}
          className="shrink-0 rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
      </AnimatePresence>
    </>
  );
}



export function GiftStatusBadge({ status }: { status: AdminGiftStatus }) {

  const { t } = useTranslation();

  const config = {

    active: {

      label: t.admin.promotions.statusActive,

      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",

      dot: "bg-emerald-500",

    },

    expired: {

      label: t.admin.promotions.statusExpired,

      className: "bg-surface-100 text-surface-600 ring-surface-200/80",

      dot: "bg-surface-400",

    },

    revoked: {

      label: t.admin.promotions.statusRevoked,

      className: "bg-red-50 text-red-700 ring-red-200/80",

      dot: "bg-red-500",

    },

  }[status];



  return (

    <span

      className={cn(

        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",

        config.className

      )}

    >

      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />

      {config.label}

    </span>

  );

}



export function useGiftTypeLabel() {

  const { t } = useTranslation();

  return (type: AdminGiftType) => {

    const labels = t.admin.promotions.giftTypes as Record<string, string>;

    return labels[type] ?? type;

  };

}



export function useGiftTypeDescription() {

  const { t } = useTranslation();

  return (type: AdminGiftType) => {

    const labels = t.admin.promotions.giftTypeDescriptions as Record<string, string> | undefined;

    return labels?.[type] ?? "";

  };

}



export function useGiftTypeBenefits() {
  const { t } = useTranslation();
  return (type: AdminGiftType) => {
    const raw = (t.admin.promotions.giftTypeBenefits as Record<string, string> | undefined)?.[type];
    if (!raw) return [];
    return raw.split("|").map((s) => s.trim()).filter(Boolean);
  };
}



export function usePaymentSourceLabel() {

  const { t } = useTranslation();

  return (source: AdminGiftPaymentSource | string) => {

    const labels = t.admin.promotions.paymentSources as Record<string, string> | undefined;

    return labels?.[source] ?? String(source).replace(/_/g, " ");

  };

}



export function PromotionNavTabs() {

  const pathname = usePathname();

  const { t } = useTranslation();



  const tabs = [

    { href: "/admin/promotions", label: t.admin.promotions.tabManage, icon: Gift },

    { href: "/admin/promotions/history", label: t.admin.promotions.tabHistory, icon: History },

  ];



  return (

    <div className="inline-flex gap-1 rounded-xl border border-surface-200/80 bg-surface-50/80 p-1 shadow-sm">

      {tabs.map((tab) => {

        const active = pathname === tab.href;

        return (

          <Link

            key={tab.href}

            href={tab.href}

            className={cn(

              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",

              active

                ? "bg-white text-surface-900 shadow-sm ring-1 ring-surface-200/80"

                : "text-surface-500 hover:text-surface-800"

            )}

          >

            <tab.icon className="h-4 w-4" />

            {tab.label}

          </Link>

        );

      })}

    </div>

  );

}



export function formatGiftQuantity(

  giftType: AdminGiftType,

  quantity: number | null,

  metadata: Record<string, unknown>,

  t: { admin: { promotions: { customGift: string } } }

): string {

  if (giftType === "custom_gift") {

    return String(metadata.custom_title ?? t.admin.promotions.customGift);

  }

  if (giftType === "discount_coupon") {

    return `${metadata.discount_percent ?? quantity ?? 0}%`;

  }

  if (quantity == null) return "—";

  return String(quantity);

}



export function formatExpiresAt(value: string | null, locale: Locale) {

  return value ? formatDate(value, locale) : "—";

}



export function countExpiringSoon(

  rows: { expires_at: string | null; effective_status?: AdminGiftStatus; status?: AdminGiftStatus }[],

  withinDays = 7

): number {

  const now = Date.now();

  const horizon = now + withinDays * 86400000;

  return rows.filter((row) => {

    const status = row.effective_status ?? row.status;

    if (status !== "active" || !row.expires_at) return false;

    const exp = new Date(row.expires_at).getTime();

    return exp > now && exp <= horizon;

  }).length;

}


