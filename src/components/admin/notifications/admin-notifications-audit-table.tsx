"use client";

import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import type { NotificationAuditLog } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminNotificationsAuditTableProps {
  auditLog: NotificationAuditLog[];
}

export function AdminNotificationsAuditTable({ auditLog }: AdminNotificationsAuditTableProps) {
  const { t, locale } = useTranslation();

  if (auditLog.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-surface-100 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-surface-200/80">
              <ClipboardList className="h-7 w-7 text-surface-400" strokeWidth={1.75} />
            </div>
          </div>
          <p className="mt-6 text-base font-semibold text-surface-900">
            {t.admin.notifications.auditEmptyTitle}
          </p>
          <p className="mt-2 max-w-md text-sm text-surface-500">
            {t.admin.notifications.auditEmptySubtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
              <tr className="border-b border-surface-200 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
                <th className="px-4 py-3">{t.admin.notifications.colAction}</th>
                <th className="px-4 py-3">{t.admin.notifications.colUser}</th>
                <th className="px-4 py-3">{t.admin.notifications.colDate}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {auditLog.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-surface-50/80"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-700">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-surface-500">
                    {entry.user_id?.slice(0, 8) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-surface-500">
                    {formatDate(entry.created_at, locale)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {auditLog.map((entry, index) => (
          <motion.article
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm"
          >
            <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-700">
              {entry.action}
            </span>
            <p className="mt-3 font-mono text-xs text-surface-500">
              {entry.user_id?.slice(0, 8) ?? "—"}
            </p>
            <time className="mt-2 block text-xs text-surface-400">
              {formatDate(entry.created_at, locale)}
            </time>
          </motion.article>
        ))}
      </div>
    </>
  );
}
