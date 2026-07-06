"use client";



import { useMemo, useState, useTransition } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

import {

  Bell,

  CalendarClock,

  Copy,

  Eye,

  History,

  Search,

  StickyNote,

  XCircle,

} from "lucide-react";

import {

  extendAdminGiftExpiration,

  revokeAdminGift,

  updateAdminGiftNotes,

} from "@/actions/admin-promotion.actions";

import { AdminGiftDetailModal } from "@/components/admin/promotions/admin-gift-detail-modal";

import {

  formatGiftQuantity,

  GiftStatusBadge,

  useGiftTypeLabel,

  usePaymentSourceLabel,

} from "@/components/admin/promotions/promotion-shared";

import {

  EmptyStateIllustration,

  GIFT_TYPE_VISUALS,

  ActionDropdown,

  PaymentSourceBadge,

  PremiumCard,

  UserAvatar,

} from "@/components/admin/promotions/promotion-ui";

import { PAYMENT_SOURCES, PROMOTION_UI_GIFT_TYPES } from "@/lib/gifts/constants";

import type { AdminGiftListResult, AdminGiftRow } from "@/services/admin-promotion.service";

import type { AdminGiftPaymentSource, AdminGiftType } from "@/types/database";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { cn, formatDate } from "@/lib/utils";

import { useTranslation } from "@/i18n/locale-provider";



const PREFILL_KEY = "finaura-promotion-prefill";



interface AdminActivePromotionsTableProps {

  list: AdminGiftListResult;

  isPending?: boolean;

}



export function AdminActivePromotionsTable({ list, isPending }: AdminActivePromotionsTableProps) {

  const { t, locale } = useTranslation();

  const router = useRouter();

  const giftTypeLabel = useGiftTypeLabel();

  const paymentSourceLabel = usePaymentSourceLabel();

  const [pending, startTransition] = useTransition();



  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<AdminGiftType | "all">("all");

  const [paymentFilter, setPaymentFilter] = useState<AdminGiftPaymentSource | "all">("all");



  const [viewGift, setViewGift] = useState<AdminGiftRow | null>(null);

  const [extendGiftId, setExtendGiftId] = useState<string | null>(null);

  const [extendDate, setExtendDate] = useState("");

  const [extendReason, setExtendReason] = useState("");

  const [notesGiftId, setNotesGiftId] = useState<string | null>(null);

  const [notesDraft, setNotesDraft] = useState("");

  const [revokeGiftId, setRevokeGiftId] = useState<string | null>(null);

  const [revokeReason, setRevokeReason] = useState("");



  const busy = isPending || pending;



  const filteredRows = useMemo(() => {

    return list.rows.filter((gift) => {

      if (typeFilter !== "all" && gift.gift_type !== typeFilter) return false;

      if (paymentFilter !== "all" && gift.payment_source !== paymentFilter) return false;

      if (search.trim()) {

        const q = search.toLowerCase();

        const haystack = [

          gift.recipient?.full_name,

          gift.recipient?.email,

          giftTypeLabel(gift.gift_type),

        ]

          .filter(Boolean)

          .join(" ")

          .toLowerCase();

        if (!haystack.includes(q)) return false;

      }

      return true;

    });

  }, [list.rows, typeFilter, paymentFilter, search, giftTypeLabel]);



  const handleDuplicate = (gift: AdminGiftRow) => {

    sessionStorage.setItem(

      PREFILL_KEY,

      JSON.stringify({ userId: gift.user_id, giftType: gift.gift_type })

    );

    document.getElementById("grant-promotion")?.scrollIntoView({ behavior: "smooth" });

    window.dispatchEvent(new CustomEvent("promotion-prefill"));

  };



  return (

    <>

      <section className="space-y-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h2 className="text-xl font-bold tracking-tight text-surface-900">

              {t.admin.promotions.activePromotionsTitle}

            </h2>

            <p className="mt-1 text-sm text-surface-500">{t.admin.promotions.activePromotionsSubtitle}</p>

          </div>

          <Link

            href="/admin/promotions/history"

            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"

          >

            <History className="h-4 w-4" />

            {t.admin.promotions.tabHistory}

          </Link>

        </div>



        <PremiumCard padding="sm" className="bg-surface-50/50">

          <div className="grid gap-3 lg:grid-cols-4">

            <div className="relative lg:col-span-2">

              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />

              <Input

                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder={t.admin.promotions.toolbarSearch}

                className="ps-9"

              />

            </div>

            <select

              value={typeFilter}

              onChange={(e) => setTypeFilter(e.target.value as AdminGiftType | "all")}

              className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm shadow-sm"

            >

              <option value="all">{t.admin.promotions.filterAllTypes}</option>

              {PROMOTION_UI_GIFT_TYPES.map((type) => (

                <option key={type} value={type}>

                  {giftTypeLabel(type)}

                </option>

              ))}

            </select>

            <select

              value={paymentFilter}

              onChange={(e) => setPaymentFilter(e.target.value as AdminGiftPaymentSource | "all")}

              className="h-10 rounded-xl border border-surface-200 bg-white px-3 text-sm shadow-sm"

            >

              <option value="all">{t.admin.promotions.filterAllPaymentSources}</option>

              {PAYMENT_SOURCES.map((source) => (

                <option key={source} value={source}>

                  {paymentSourceLabel(source)}

                </option>

              ))}

            </select>

          </div>

        </PremiumCard>



        <PremiumCard padding="sm" className={cn("overflow-hidden p-0", busy && "opacity-60")}>

          {filteredRows.length === 0 ? (

            <EmptyStateIllustration

              title={t.admin.promotions.emptyTitle}

              subtitle={t.admin.promotions.emptyActiveSubtitle}

              actionLabel={t.admin.promotions.emptyCta}

              onAction={() => document.getElementById("grant-promotion")?.scrollIntoView({ behavior: "smooth" })}

            />

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b border-surface-100 bg-surface-50/80">

                    {[

                      t.admin.promotions.colUser,

                      t.admin.promotions.colGiftType,

                      t.admin.promotions.colStatus,

                      t.admin.promotions.fieldPaymentSource,

                      t.admin.promotions.remaining,

                      t.admin.promotions.colCreatedAt,

                      t.admin.promotions.colExpiresAt,

                      t.admin.promotions.colGrantedBy,

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

                  {filteredRows.map((gift, index) => (

                    <motion.tr

                      key={gift.id}

                      initial={{ opacity: 0 }}

                      animate={{ opacity: 1 }}

                      transition={{ delay: index * 0.02 }}

                      className="group transition-colors hover:bg-brand-50/30"

                    >

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                          <UserAvatar

                            name={gift.recipient?.full_name}

                            email={gift.recipient?.email}

                            avatarUrl={gift.recipient?.avatar_url}

                            size="sm"

                          />

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-surface-900">

                              {gift.recipient?.full_name || "—"}

                            </p>

                            <p className="truncate text-xs text-surface-500">{gift.recipient?.email}</p>

                          </div>

                        </div>

                      </td>

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-2.5">

                          {(() => {

                            const visual = GIFT_TYPE_VISUALS[gift.gift_type];

                            const Icon = visual?.Icon;

                            return Icon ? (

                              <div

                                className={cn(

                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset",

                                  visual.gradient,

                                  visual.ring

                                )}

                              >

                                <Icon className={cn("h-4 w-4", visual.iconColor)} />

                              </div>

                            ) : null;

                          })()}

                          <span className="text-sm font-medium text-surface-800">

                            {giftTypeLabel(gift.gift_type)}

                          </span>

                        </div>

                      </td>

                      <td className="px-4 py-4">

                        <GiftStatusBadge status={gift.effective_status} />

                      </td>

                      <td className="px-4 py-4">

                        <PaymentSourceBadge

                          source={gift.payment_source}

                          label={paymentSourceLabel(gift.payment_source)}

                        />

                      </td>

                      <td className="px-4 py-4 text-sm text-surface-700">

                        {formatGiftQuantity(gift.gift_type, gift.quantity_remaining ?? gift.quantity, gift.metadata, t)}

                      </td>

                      <td className="px-4 py-4 text-sm text-surface-500">

                        {formatDate(gift.created_at, locale)}

                      </td>

                      <td className="px-4 py-4 text-sm text-surface-500">

                        {gift.expires_at ? formatDate(gift.expires_at, locale) : "—"}

                      </td>

                      <td className="px-4 py-4 text-sm text-surface-600">

                        {gift.granter?.full_name || gift.granter?.email || "—"}

                      </td>

                      <td className="px-4 py-4 text-end">

                        <ActionDropdown

                          label={t.admin.promotions.colActions}

                          items={[

                            {

                              label: t.admin.promotions.actionView,

                              icon: Eye,

                              onClick: () => setViewGift(gift),

                            },

                            {

                              label: t.admin.promotions.actionExtend,

                              icon: CalendarClock,

                              disabled: busy || gift.status === "revoked",

                              onClick: () => {

                                setExtendGiftId(gift.id);

                                setExtendDate(gift.expires_at?.slice(0, 10) ?? "");

                                setExtendReason("");

                              },

                            },

                            {

                              label: t.admin.promotions.actionDuplicate,

                              icon: Copy,

                              onClick: () => handleDuplicate(gift),

                            },

                            {

                              label: t.admin.promotions.actionNotify,

                              icon: Bell,

                              href: "/admin/notifications",

                            },

                            {

                              label: t.admin.promotions.actionHistory,

                              icon: History,

                              onClick: () =>

                                router.push(

                                  `/admin/promotions/history?q=${encodeURIComponent(gift.recipient?.email ?? "")}`

                                ),

                            },

                            {

                              label: t.admin.promotions.actionEdit,

                              icon: StickyNote,

                              disabled: busy || gift.status === "revoked",

                              onClick: () => {

                                setNotesGiftId(gift.id);

                                setNotesDraft(gift.notes ?? "");

                              },

                            },

                            {

                              label: t.admin.promotions.actionRevoke,

                              icon: XCircle,

                              disabled: busy || gift.status === "revoked",

                              danger: true,

                              onClick: () => {

                                setRevokeGiftId(gift.id);

                                setRevokeReason("");

                              },

                            },

                          ]}

                        />

                      </td>

                    </motion.tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </PremiumCard>

      </section>



      {viewGift && <AdminGiftDetailModal gift={viewGift} onClose={() => setViewGift(null)} />}



      <ModalShell open={!!notesGiftId} onClose={() => setNotesGiftId(null)} title={t.admin.promotions.editNotesTitle}>

        <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} className="min-h-[120px]" />

        <ModalActions

          onCancel={() => setNotesGiftId(null)}

          confirmLabel={t.admin.promotions.saveNotes}

          disabled={busy}

          onConfirm={() =>

            notesGiftId &&

            startTransition(async () => {

              const result = await updateAdminGiftNotes(notesGiftId, notesDraft);

              if (!result?.error) {

                setNotesGiftId(null);

                router.refresh();

              }

            })

          }

        />

      </ModalShell>



      <ModalShell open={!!extendGiftId} onClose={() => setExtendGiftId(null)} title={t.admin.promotions.extendTitle}>

        <Input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} />

        <Textarea

          value={extendReason}

          onChange={(e) => setExtendReason(e.target.value)}

          placeholder={t.admin.promotions.fieldExtendReason}

          className="mt-3 min-h-[80px]"

        />

        <ModalActions

          onCancel={() => setExtendGiftId(null)}

          confirmLabel={t.admin.promotions.confirmExtend}

          disabled={busy || !extendDate}

          onConfirm={() =>

            extendGiftId &&

            startTransition(async () => {

              const result = await extendAdminGiftExpiration(extendGiftId, extendDate, extendReason || undefined);

              if (!result?.error) {

                setExtendGiftId(null);

                router.refresh();

              }

            })

          }

        />

      </ModalShell>



      <ModalShell open={!!revokeGiftId} onClose={() => setRevokeGiftId(null)} title={t.admin.promotions.revokeTitle}>

        <p className="text-sm text-surface-500">{t.admin.promotions.revokeSubtitle}</p>

        <Textarea

          value={revokeReason}

          onChange={(e) => setRevokeReason(e.target.value)}

          placeholder={t.admin.promotions.fieldRevokeReason}

          className="mt-4 min-h-[80px]"

        />

        <ModalActions

          onCancel={() => setRevokeGiftId(null)}

          confirmLabel={t.admin.promotions.confirmRevoke}

          disabled={busy}

          danger
          onConfirm={() =>
            revokeGiftId &&
            startTransition(async () => {
              const result = await revokeAdminGift(revokeGiftId, revokeReason || undefined);
              if (!result?.error) {
                setRevokeGiftId(null);
                router.refresh();
              }
            })
          }
        />

      </ModalShell>

    </>

  );

}



function ModalShell({

  open,

  onClose,

  title,

  children,

}: {

  open: boolean;

  onClose: () => void;

  title: string;

  children: React.ReactNode;

}) {

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >

        <h3 className="text-lg font-bold text-surface-900">{title}</h3>

        <div className="mt-4">{children}</div>

      </motion.div>

    </div>

  );

}



function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  disabled,
  danger,
}: {
  onCancel: () => void;
  onConfirm?: () => void;
  confirmLabel: string;
  disabled?: boolean;
  danger?: boolean;
}) {

  return (

    <div className="mt-5 flex justify-end gap-2">

      <Button type="button" variant="outline" onClick={onCancel}>

        Cancel

      </Button>

      <Button

        type="button"

        disabled={disabled}

        variant={danger ? "danger" : "primary"}

        onClick={onConfirm}

      >

        {confirmLabel}

      </Button>

    </div>

  );

}



export { PREFILL_KEY };


