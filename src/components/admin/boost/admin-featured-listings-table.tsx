"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Ban,
  CalendarPlus,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  adminDisableBoostCampaign,
  adminExtendBoostDuration,
  adminMoveBoostPosition,
  adminRemoveBoost,
} from "@/actions/admin-boost.actions";
import {
  AdminBoostToast,
  type BoostToastState,
} from "@/components/admin/boost/boost-shared";
import { ActionDropdown, PremiumCard } from "@/components/admin/promotions/promotion-ui";
import type { AdminFeaturedListingRow } from "@/services/admin-boost.service";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminFeaturedListingsTableProps {
  listings: AdminFeaturedListingRow[];
}

export function AdminFeaturedListingsTable({ listings }: AdminFeaturedListingsTableProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [toast, setToast] = useState<BoostToastState>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [extendId, setExtendId] = useState<string | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState("3");
  const [newPosition, setNewPosition] = useState("1");
  const [isPending, startTransition] = useTransition();

  const refresh = () => router.refresh();

  const runAction = (
    campaignId: string,
    action: () => Promise<{ success: true } | { error: string }>,
    successMessage: string
  ) => {
    startTransition(async () => {
      setPendingId(campaignId);
      const result = await action();
      setPendingId(null);
      if ("error" in result) {
        setToast({ type: "error", message: result.error });
        return;
      }
      setToast({ type: "success", message: successMessage });
      setExtendId(null);
      setMoveId(null);
      refresh();
    });
  };

  return (
    <>
      <PremiumCard padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/80 text-start text-xs font-semibold uppercase tracking-wider text-surface-500">
                <th className="px-4 py-3">{t.admin.boost.colListing}</th>
                <th className="px-4 py-3">{t.admin.boost.colOwner}</th>
                <th className="px-4 py-3">{t.admin.boost.colProduct}</th>
                <th className="px-4 py-3">{t.admin.boost.colPosition}</th>
                <th className="px-4 py-3">{t.admin.boost.colAmount}</th>
                <th className="px-4 py-3">{t.admin.boost.colRemaining}</th>
                <th className="px-4 py-3">{t.admin.boost.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-surface-500">
                    {t.admin.boost.noFeaturedListings}
                  </td>
                </tr>
              ) : (
                listings.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-50/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-900">{row.listingTitle}</p>
                      <a
                        href={`/properties/${row.listingId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
                      >
                        {t.admin.boost.viewListing}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3 text-surface-600">{row.ownerEmail}</td>
                    <td className="px-4 py-3 text-surface-600">{row.productName}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-surface-900">
                      #{row.position}
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums text-surface-900">
                      {formatPrice(row.amount, undefined, locale)}
                    </td>
                    <td className="px-4 py-3">
                      {row.expiresAt ? (
                        <BoostCountdown expiresAt={row.expiresAt} compact variant="light" />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ActionDropdown
                        label={t.admin.boost.colActions}
                        items={[
                          {
                            label: t.admin.boost.actionExtend,
                            icon: CalendarPlus,
                            onClick: () => {
                              setExtendId(row.id);
                              setExtendDays("3");
                            },
                          },
                          {
                            label: t.admin.boost.actionMove,
                            icon: ArrowLeftRight,
                            onClick: () => {
                              setMoveId(row.id);
                              setNewPosition(String(row.position));
                            },
                          },
                          {
                            label: t.admin.boost.actionRemove,
                            icon: Trash2,
                            danger: true,
                            disabled: isPending && pendingId === row.id,
                            onClick: () =>
                              runAction(
                                row.id,
                                () => adminRemoveBoost(row.id),
                                t.admin.boost.removeSuccess
                              ),
                          },
                          {
                            label: t.admin.boost.actionDisable,
                            icon: Ban,
                            danger: true,
                            disabled: isPending && pendingId === row.id,
                            onClick: () =>
                              runAction(
                                row.id,
                                () => adminDisableBoostCampaign(row.id),
                                t.admin.boost.disableSuccess
                              ),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      {extendId && (
        <InlineActionPanel
          title={t.admin.boost.extendTitle}
          onClose={() => setExtendId(null)}
        >
          <label className="block text-sm font-medium text-surface-700">
            {t.admin.boost.extendDaysLabel}
          </label>
          <Input
            type="number"
            min={1}
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            className="mt-2"
          />
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              isLoading={isPending}
              onClick={() =>
                runAction(
                  extendId,
                  () => adminExtendBoostDuration(extendId, Number(extendDays)),
                  t.admin.boost.extendSuccess
                )
              }
            >
              {t.admin.boost.confirmExtend}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExtendId(null)}>
              {t.admin.boost.cancel}
            </Button>
          </div>
        </InlineActionPanel>
      )}

      {moveId && (
        <InlineActionPanel title={t.admin.boost.moveTitle} onClose={() => setMoveId(null)}>
          <label className="block text-sm font-medium text-surface-700">
            {t.admin.boost.movePositionLabel}
          </label>
          <Input
            type="number"
            min={1}
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            className="mt-2"
          />
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              isLoading={isPending}
              onClick={() =>
                runAction(
                  moveId,
                  () => adminMoveBoostPosition(moveId, Number(newPosition)),
                  t.admin.boost.moveSuccess
                )
              }
            >
              {t.admin.boost.confirmMove}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMoveId(null)}>
              {t.admin.boost.cancel}
            </Button>
          </div>
        </InlineActionPanel>
      )}

      <AdminBoostToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

function InlineActionPanel({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
