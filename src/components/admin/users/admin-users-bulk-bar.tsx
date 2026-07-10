"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Bell,
  Crown,
  Download,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminUsersBulkBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
}

function BulkButton({
  icon: Icon,
  label,
  danger,
}: {
  icon: typeof ShieldCheck;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold opacity-60",
        danger
          ? "border border-red-200/80 bg-red-50/80 text-red-500"
          : "border border-white/20 bg-white/10 text-white"
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function AdminUsersBulkBar({ selectedCount, onDeselectAll }: AdminUsersBulkBarProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-4 bottom-6 z-[80] mx-auto max-w-4xl rounded-2xl border border-surface-800/20 bg-surface-950 px-4 py-3 shadow-2xl sm:inset-x-auto sm:w-[min(100%,56rem)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">
                <AnimatedCounter value={selectedCount} />{" "}
                {t.admin.users.bulk.selectedLabel}
              </span>
              <button
                type="button"
                onClick={onDeselectAll}
                className="text-xs font-medium text-white/70 underline-offset-2 hover:text-white hover:underline"
              >
                {t.admin.users.bulk.deselectAll}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <BulkButton icon={ShieldCheck} label={t.admin.users.actionVerify} />
              <BulkButton icon={Crown} label={t.admin.users.drawer.grantPremium} />
              <BulkButton icon={Ban} label={t.admin.users.actionSuspend} />
              <BulkButton icon={Trash2} label={t.admin.users.actionDelete} danger />
              <BulkButton icon={Bell} label={t.admin.users.bulk.notify} />
              <BulkButton icon={Download} label={t.admin.users.export} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
