"use client";



import { useCallback, useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { motion } from "framer-motion";

import {

  ChevronLeft,

  ChevronRight,

  Eye,

  Filter,

  Search,

  Sparkles,

} from "lucide-react";

import { AdminGiftDetailModal } from "@/components/admin/promotions/admin-gift-detail-modal";

import {

  formatGiftQuantity,

  GiftStatusBadge,

  PromotionNavTabs,

  useGiftTypeLabel,

  usePaymentSourceLabel,

} from "@/components/admin/promotions/promotion-shared";

import {

  EmptyStateIllustration,

  PaymentSourceBadge,

  PremiumCard,

  UserAvatar,

} from "@/components/admin/promotions/promotion-ui";

import { PROMOTION_UI_GIFT_TYPES } from "@/lib/gifts/constants";
import type { AdminGiftListResult, AdminGiftRow } from "@/services/admin-promotion.service";
import type { AdminGiftStatus, AdminGiftType } from "@/types/database";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { cn, formatDate } from "@/lib/utils";

import { useTranslation } from "@/i18n/locale-provider";



interface AdminPromotionsHistoryManagerProps {

  list: AdminGiftListResult;

}



export function AdminPromotionsHistoryManager({ list }: AdminPromotionsHistoryManagerProps) {

  const { t, locale } = useTranslation();

  const router = useRouter();

  const searchParams = useSearchParams();

  const giftTypeLabel = useGiftTypeLabel();

  const paymentSourceLabel = usePaymentSourceLabel();

  const [isPending, startTransition] = useTransition();



  const [historySearch, setHistorySearch] = useState(searchParams.get("q") ?? "");

  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");

  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");

  const [viewGift, setViewGift] = useState<AdminGiftRow | null>(null);



  const statusFilter = (searchParams.get("status") ?? "all") as AdminGiftStatus | "all";

  const typeFilter = (searchParams.get("type") ?? "all") as AdminGiftType | "all";

  const updateParams = useCallback(

    (updates: Record<string, string | null>) => {

      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {

        if (!value) params.delete(key);

        else params.set(key, value);

      });

      startTransition(() => router.push(`/admin/promotions/history?${params.toString()}`));

    },

    [router, searchParams]

  );



  const applyFilters = () => {

    updateParams({

      q: historySearch.trim() || null,

      from: dateFrom || null,

      to: dateTo || null,

      page: null,

    });

  };



  return (

    <div className="space-y-10 pb-12">

      <motion.header

        initial={{ opacity: 0, y: -8 }}

        animate={{ opacity: 1, y: 0 }}

        className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"

      >

        <div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200/80">

            <Sparkles className="h-3.5 w-3.5" />

            History

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">

            {t.admin.promotions.historyPageTitle}

          </h1>

          <p className="mt-2 max-w-2xl text-base text-surface-500">{t.admin.promotions.historyPageSubtitle}</p>

        </div>

        <PromotionNavTabs />

      </motion.header>



      <PremiumCard padding="sm" className="bg-surface-50/50">

        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-700">

          <Filter className="h-4 w-4" />

          {t.admin.promotions.filtersTitle}

        </div>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-6">

          <div className="relative xl:col-span-2">

            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />

            <Input

              value={historySearch}

              onChange={(event) => setHistorySearch(event.target.value)}

              onKeyDown={(event) => {

                if (event.key === "Enter") applyFilters();

              }}

              placeholder={t.admin.promotions.historySearchPlaceholder}

              className="ps-9"

            />

          </div>

          <select

            value={typeFilter}

            onChange={(event) =>

              updateParams({ type: event.target.value === "all" ? null : event.target.value, page: null })

            }

            className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm shadow-sm"

          >

            <option value="all">{t.admin.promotions.filterAllTypes}</option>

            {PROMOTION_UI_GIFT_TYPES.map((type) => (

              <option key={type} value={type}>

                {giftTypeLabel(type)}

              </option>

            ))}

            <option value="discount_coupon">{giftTypeLabel("discount_coupon")}</option>

          </select>

          <select

            value={statusFilter}

            onChange={(event) =>

              updateParams({ status: event.target.value === "all" ? null : event.target.value, page: null })

            }

            className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm shadow-sm"

          >

            <option value="all">{t.admin.promotions.filterAllStatuses}</option>

            <option value="active">{t.admin.promotions.statusActive}</option>

            <option value="expired">{t.admin.promotions.statusExpired}</option>

            <option value="revoked">{t.admin.promotions.statusRevoked}</option>

          </select>

          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label={t.admin.promotions.filterDateFrom} />

          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label={t.admin.promotions.filterDateTo} />

          <Button type="button" onClick={applyFilters} className="xl:col-span-2">

            {t.admin.promotions.searchButton}

          </Button>

        </div>

      </PremiumCard>



      <PremiumCard padding="sm" className={cn("overflow-hidden p-0", isPending && "opacity-60")}>

        {list.rows.length === 0 ? (

          <EmptyStateIllustration

            title={t.admin.promotions.emptyTitle}

            subtitle={t.admin.promotions.emptySubtitle}

          />

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead>

                <tr className="border-b border-surface-100 bg-surface-50/80">

                  {[

                    t.admin.promotions.colAdmin,

                    t.admin.promotions.colUser,

                    t.admin.promotions.colGiftType,

                    t.admin.promotions.fieldPaymentSource,

                    t.admin.promotions.colCreatedAt,

                    t.admin.promotions.colExpiresAt,

                    t.admin.promotions.colStatus,

                    t.admin.promotions.colActions,

                  ].map((col) => (

                    <th

                      key={col}

                      className="px-4 py-3.5 text-start text-[11px] font-semibold uppercase tracking-wider text-surface-500"

                    >

                      {col}

                    </th>

                  ))}

                </tr>

              </thead>

              <tbody className="divide-y divide-surface-100">

                {list.rows.map((gift, index) => (

                  <motion.tr

                    key={gift.id}

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: index * 0.02 }}

                    className="hover:bg-surface-50/60"

                  >

                    <td className="px-4 py-4 text-sm text-surface-700">

                      {gift.granter?.full_name || gift.granter?.email || "—"}

                    </td>

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-2">

                        <UserAvatar

                          name={gift.recipient?.full_name}

                          email={gift.recipient?.email}

                          avatarUrl={gift.recipient?.avatar_url}

                          size="sm"

                        />

                        <div>

                          <p className="text-sm font-medium text-surface-900">

                            {gift.recipient?.full_name || "—"}

                          </p>

                          <p className="text-xs text-surface-500">{gift.recipient?.email}</p>

                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-4 text-sm text-surface-800">

                      {giftTypeLabel(gift.gift_type)}

                      <span className="block text-xs text-surface-500">

                        {formatGiftQuantity(gift.gift_type, gift.quantity, gift.metadata, t)}

                      </span>

                    </td>

                    <td className="px-4 py-4">

                      <PaymentSourceBadge

                        source={gift.payment_source}

                        label={paymentSourceLabel(gift.payment_source)}

                      />

                    </td>

                    <td className="px-4 py-4 text-sm text-surface-500">

                      {formatDate(gift.created_at, locale)}

                    </td>

                    <td className="px-4 py-4 text-sm text-surface-500">

                      {gift.expires_at ? formatDate(gift.expires_at, locale) : "—"}

                    </td>

                    <td className="px-4 py-4">

                      <GiftStatusBadge status={gift.effective_status} />

                    </td>

                    <td className="px-4 py-4 text-end">

                      <Button type="button" size="sm" variant="ghost" onClick={() => setViewGift(gift)}>

                        <Eye className="h-4 w-4" />

                      </Button>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </PremiumCard>



      {list.totalPages > 1 && (

        <div className="flex items-center justify-between">

          <p className="text-sm text-surface-500">

            {t.admin.promotions.pageInfo

              .replace("{page}", String(list.page))

              .replace("{totalPages}", String(list.totalPages))

              .replace("{total}", String(list.total))}

          </p>

          <div className="flex gap-2">

            <Button

              type="button"

              size="sm"

              variant="outline"

              disabled={list.page <= 1 || isPending}

              onClick={() => updateParams({ page: String(list.page - 1) })}

            >

              <ChevronLeft className="h-4 w-4" />

            </Button>

            <Button

              type="button"

              size="sm"

              variant="outline"

              disabled={list.page >= list.totalPages || isPending}

              onClick={() => updateParams({ page: String(list.page + 1) })}

            >

              <ChevronRight className="h-4 w-4" />

            </Button>

          </div>

        </div>

      )}



      {viewGift && <AdminGiftDetailModal gift={viewGift} onClose={() => setViewGift(null)} />}

    </div>

  );

}


