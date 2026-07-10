"use client";

import { motion } from "framer-motion";
import type { AdminBroadcastListResult } from "@/services/admin-notification.service";
import { getBroadcastStatus } from "@/lib/admin/broadcast-display";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BroadcastRecentListProps {
  broadcasts: AdminBroadcastListResult;
  loading?: boolean;
}

function StatusBadge({ status }: { status: "delivered" | "partial" | "pending" }) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;

  const config = {
    delivered: {
      label: bc.statusDelivered,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    },
    partial: {
      label: bc.statusPartial,
      className: "bg-amber-50 text-amber-700 ring-amber-200/80",
    },
    pending: {
      label: bc.statusPending,
      className: "bg-surface-100 text-surface-600 ring-surface-200/80",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function BroadcastRecentList({ broadcasts, loading }: BroadcastRecentListProps) {
  const { t, locale } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;
  const audienceLabels = t.admin.notifications.audiences as Record<string, string>;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-surface-100" />
        ))}
      </div>
    );
  }

  if (broadcasts.rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-200 px-6 py-12 text-center">
        <p className="text-sm font-semibold text-surface-700">{t.admin.notifications.noBroadcasts}</p>
        <p className="mt-1 text-xs text-surface-500">{bc.recentEmptySubtitle}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
              <tr className="border-b border-surface-200 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
                <th className="px-4 py-3">{bc.colTitle}</th>
                <th className="px-4 py-3">{bc.colAudience}</th>
                <th className="px-4 py-3">{bc.colSent}</th>
                <th className="px-4 py-3">{bc.colOpened}</th>
                <th className="px-4 py-3">{bc.colRead}</th>
                <th className="px-4 py-3">{bc.colCreated}</th>
                <th className="px-4 py-3">{bc.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {broadcasts.rows.map((broadcast, index) => {
                const status = getBroadcastStatus(
                  broadcast.delivered_count,
                  broadcast.recipient_count
                );

                return (
                  <motion.tr
                    key={broadcast.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="transition-colors hover:bg-surface-50/80"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-semibold text-surface-900">{broadcast.title}</p>
                      <p className="truncate text-xs text-surface-500">{broadcast.body}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-700">
                        {audienceLabels[broadcast.audience] ?? broadcast.audience}
                        {broadcast.target_city ? ` · ${broadcast.target_city}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-surface-800">
                      {broadcast.recipient_count}
                    </td>
                    <td className="px-4 py-3 text-surface-400">{t.admin.notifications.comingSoon}</td>
                    <td className="px-4 py-3 font-medium text-brand-700">{broadcast.read_count}</td>
                    <td className="px-4 py-3 text-surface-500">
                      {formatDate(broadcast.created_at, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {broadcasts.rows.map((broadcast, index) => {
          const status = getBroadcastStatus(
            broadcast.delivered_count,
            broadcast.recipient_count
          );

          return (
            <motion.article
              key={broadcast.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-surface-900">{broadcast.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-surface-500">{broadcast.body}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-surface-100 px-2.5 py-1 font-semibold text-surface-700">
                  {audienceLabels[broadcast.audience] ?? broadcast.audience}
                </span>
                <span className="text-surface-500">
                  {bc.colSent}: {broadcast.recipient_count}
                </span>
                <span className="text-surface-500">
                  {bc.colRead}: {broadcast.read_count}
                </span>
              </div>
              <time className="mt-2 block text-xs text-surface-400">
                {formatDate(broadcast.created_at, locale)}
              </time>
            </motion.article>
          );
        })}
      </div>
    </>
  );
}
