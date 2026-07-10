"use client";

import { PremiumCard } from "@/components/admin/promotions/promotion-ui";
import { useBoostActionLabel } from "@/components/admin/boost/boost-shared";
import type { AdminBoostHistoryRow } from "@/services/admin-boost.service";
import { formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminBoostHistoryTableProps {
  history: AdminBoostHistoryRow[];
}

export function AdminBoostHistoryTable({ history }: AdminBoostHistoryTableProps) {
  const { t, locale } = useTranslation();
  const actionLabel = useBoostActionLabel();

  return (
    <PremiumCard padding="none">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50/80 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
              <th className="px-4 py-3">{t.admin.boost.colListing}</th>
              <th className="px-4 py-3">{t.admin.boost.colOwner}</th>
              <th className="px-4 py-3">{t.admin.boost.colAction}</th>
              <th className="px-4 py-3">{t.admin.boost.colAmount}</th>
              <th className="px-4 py-3">{t.admin.boost.colPositionChange}</th>
              <th className="px-4 py-3">{t.admin.boost.colDate}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-surface-500">
                  {t.admin.boost.noHistory}
                </td>
              </tr>
            ) : (
              history.map((row) => (
                <tr key={row.id} className="hover:bg-surface-50/60">
                  <td className="px-4 py-3 font-medium text-surface-900">{row.listingTitle}</td>
                  <td className="px-4 py-3 text-surface-600">{row.ownerEmail}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface-100 px-2.5 py-1 text-xs font-semibold text-surface-700">
                      {actionLabel(row.action)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-surface-900">
                    {formatPrice(row.amount, undefined, locale)}
                  </td>
                  <td className="px-4 py-3 text-surface-600">
                    {row.previousPosition !== null || row.newPosition !== null
                      ? `${row.previousPosition ?? "—"} → ${row.newPosition ?? "—"}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-surface-500">
                    {formatDate(row.createdAt, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PremiumCard>
  );
}
