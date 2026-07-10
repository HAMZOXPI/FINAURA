"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Rocket, Settings, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export type BoostToastState = { type: "success" | "error"; message: string } | null;

export function AdminBoostToast({
  toast,
  onClose,
}: {
  toast: BoostToastState;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={toast.message}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.96 }}
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-6 end-6 z-[100] flex max-w-md items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-sm",
          toast.type === "success"
            ? "border-emerald-200/80 bg-emerald-50/95 text-emerald-950"
            : "border-red-200/80 bg-red-50/95 text-red-950"
        )}
      >
        {toast.type === "success" ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export function BoostNavTabs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { href: "/admin/boost", label: t.admin.boost.tabManage, icon: Rocket },
    { href: "/admin/boost/settings", label: t.admin.boost.tabSettings, icon: Settings },
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

export function useBoostActionLabel() {
  const { t } = useTranslation();

  return (action: string) => {
    const map: Record<string, string> = {
      created: t.admin.boost.actionCreated,
      activated: t.admin.boost.actionActivated,
      outbid: t.admin.boost.actionOutbid,
      position_changed: t.admin.boost.actionPositionChanged,
      expired: t.admin.boost.actionExpired,
      removed: t.admin.boost.actionRemoved,
      cancelled: t.admin.boost.actionCancelled,
      extended: t.admin.boost.actionExtended,
      disabled: t.admin.boost.actionDisabled,
    };
    return map[action] ?? action;
  };
}
