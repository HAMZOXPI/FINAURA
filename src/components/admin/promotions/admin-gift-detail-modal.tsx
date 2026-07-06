"use client";



import { useEffect, useState, type ReactNode } from "react";

import { motion } from "framer-motion";

import { Clock, X } from "lucide-react";

import { fetchGiftAuditLog } from "@/actions/admin-promotion.actions";

import {

  formatGiftQuantity,

  GiftStatusBadge,

  useGiftTypeLabel,

  usePaymentSourceLabel,

} from "@/components/admin/promotions/promotion-shared";

import { PaymentSourceBadge, PremiumCard, UserAvatar } from "@/components/admin/promotions/promotion-ui";

import type { AdminGiftAuditRow, AdminGiftRow } from "@/services/admin-promotion.service";

import { Button } from "@/components/ui/button";

import { formatDate } from "@/lib/utils";

import { useTranslation } from "@/i18n/locale-provider";



interface AdminGiftDetailModalProps {

  gift: AdminGiftRow;

  onClose: () => void;

}



export function AdminGiftDetailModal({ gift, onClose }: AdminGiftDetailModalProps) {

  const { t, locale } = useTranslation();

  const giftTypeLabel = useGiftTypeLabel();

  const paymentSourceLabel = usePaymentSourceLabel();

  const [auditLog, setAuditLog] = useState<AdminGiftAuditRow[]>([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    fetchGiftAuditLog(gift.id).then((result) => {

      if ("logs" in result && result.logs) setAuditLog(result.logs);

      setLoading(false);

    });

  }, [gift.id]);



  const auditActionLabel = (action: string) => {

    const labels = t.admin.promotions.auditActions as Record<string, string>;

    return labels[action] ?? action;

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/40 p-4 backdrop-blur-sm">

      <motion.div

        initial={{ opacity: 0, scale: 0.96, y: 8 }}

        animate={{ opacity: 1, scale: 1, y: 0 }}

        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"

      >

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-surface-100 bg-white/95 px-6 py-5 backdrop-blur-sm">

          <div>

            <h3 className="text-xl font-bold tracking-tight text-surface-900">

              {t.admin.promotions.giftDetailTitle}

            </h3>

            <p className="mt-1 text-sm text-surface-500">{giftTypeLabel(gift.gift_type)}</p>

          </div>

          <Button type="button" size="sm" variant="ghost" onClick={onClose} className="rounded-xl">

            <X className="h-4 w-4" />

          </Button>

        </div>



        <div className="space-y-6 p-6">

          <div className="flex items-center gap-4 rounded-xl border border-surface-200/80 bg-surface-50/50 p-4">

            <UserAvatar

              name={gift.recipient?.full_name}

              email={gift.recipient?.email}

              avatarUrl={gift.recipient?.avatar_url}

              size="lg"

            />

            <div>

              <p className="font-semibold text-surface-900">{gift.recipient?.full_name || "—"}</p>

              <p className="text-sm text-surface-500">{gift.recipient?.email}</p>

              <div className="mt-2 flex flex-wrap gap-2">

                <GiftStatusBadge status={gift.effective_status} />

                <PaymentSourceBadge

                  source={gift.payment_source}

                  label={paymentSourceLabel(gift.payment_source)}

                />

              </div>

            </div>

          </div>



          <dl className="grid gap-3 sm:grid-cols-2">

            <DetailItem label={t.admin.promotions.colQuantity}>

              {formatGiftQuantity(gift.gift_type, gift.quantity, gift.metadata, t)}

            </DetailItem>

            <DetailItem label={t.admin.promotions.colGrantedBy}>

              {gift.granter?.full_name || gift.granter?.email || "—"}

            </DetailItem>

            <DetailItem label={t.admin.promotions.colCreatedAt}>

              {formatDate(gift.created_at, locale)}

            </DetailItem>

            <DetailItem label={t.admin.promotions.colExpiresAt}>

              {gift.expires_at ? formatDate(gift.expires_at, locale) : "—"}

            </DetailItem>

          </dl>



          {gift.notes && (

            <PremiumCard padding="sm" className="bg-surface-50/50">

              <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">

                {t.admin.promotions.colNotes}

              </p>

              <p className="mt-2 text-sm text-surface-700">{gift.notes}</p>

            </PremiumCard>

          )}



          <section>

            <h4 className="text-sm font-semibold text-surface-900">{t.admin.promotions.auditLogTitle}</h4>

            {loading ? (

              <div className="mt-4 space-y-3">

                {Array.from({ length: 3 }).map((_, i) => (

                  <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-100" />

                ))}

              </div>

            ) : auditLog.length === 0 ? (

              <p className="mt-3 text-sm text-surface-500">{t.admin.promotions.auditLogEmpty}</p>

            ) : (

              <ol className="relative mt-6 space-y-0 border-s-2 border-surface-200 ms-4 ps-6">

                {auditLog.map((entry, index) => (

                  <motion.li

                    key={entry.id}

                    initial={{ opacity: 0, x: -8 }}

                    animate={{ opacity: 1, x: 0 }}

                    transition={{ delay: index * 0.05 }}

                    className="relative pb-8 last:pb-0"

                  >

                    <span className="absolute -start-[1.65rem] flex h-8 w-8 items-center justify-center rounded-full bg-white ring-2 ring-brand-200">

                      <Clock className="h-3.5 w-3.5 text-brand-600" />

                    </span>

                    <div className="rounded-xl border border-surface-200/80 bg-white p-4 shadow-sm">

                      <div className="flex flex-wrap items-start justify-between gap-2">

                        <p className="font-semibold text-surface-900">{auditActionLabel(entry.action)}</p>

                        <time className="text-xs text-surface-500">

                          {formatDate(entry.created_at, locale)}

                        </time>

                      </div>

                      <p className="mt-1 text-sm text-surface-600">

                        {entry.admin?.full_name || entry.admin?.email || "—"}

                      </p>

                      {entry.reason && (

                        <p className="mt-2 rounded-lg bg-surface-50 px-3 py-2 text-xs text-surface-600">

                          {entry.reason}

                        </p>

                      )}

                    </div>

                  </motion.li>

                ))}

              </ol>

            )}

          </section>

        </div>



        <div className="border-t border-surface-100 bg-surface-50/50 px-6 py-4">

          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">

            {t.admin.promotions.close}

          </Button>

        </div>

      </motion.div>

    </div>

  );

}



function DetailItem({ label, children }: { label: string; children: ReactNode }) {

  return (

    <div className="rounded-xl border border-surface-200/60 bg-surface-50/30 px-4 py-3">

      <dt className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">{label}</dt>

      <dd className="mt-1 text-sm font-medium text-surface-900">{children}</dd>

    </div>

  );

}


