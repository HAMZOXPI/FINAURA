"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CreditCard,
  History,
  Hourglass,
  RefreshCw,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { BoostCountdown } from "@/components/boost/boost-countdown";
import { BoostCheckoutModal } from "@/components/boost/boost-checkout-modal";
import {
  BoostPaymentReceipt,
  boostPaymentToReceipt,
} from "@/components/boost/boost-payment-receipt";
import { BoostStatusBadge } from "@/components/boost/boost-status-badge";
import { resolveCampaignDisplayStatus } from "@/lib/boost/ui";
import { useBoostCheckout } from "@/hooks/use-boost-checkout";
import { Button } from "@/components/ui/button";
import type {
  BoostCenterData,
  BoostCenterCampaign,
  BoostCenterHistoryEntry,
  BoostCenterPayment,
} from "@/types/boost";
import type { BoostHistoryAction } from "@/types/database";
import { formatDate, formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostCenterViewProps {
  initialData: BoostCenterData;
}

export function BoostCenterView({ initialData }: BoostCenterViewProps) {
  const { t, locale } = useTranslation();
  const [data, setData] = useState(initialData);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const refreshData = useCallback(async () => {
    const { fetchBoostCenterData } = await import("@/actions/boost.actions");
    const refreshed = await fetchBoostCenterData();
    setData(refreshed);
  }, []);

  const {
    checkout,
    error: checkoutError,
    isPreparing,
    isPaying,
    openCheckout,
    closeCheckout,
    confirmPayment,
  } = useBoostCheckout({
    onSuccess: async () => {
      setMessage({ type: "success", text: t.boost.renewSuccess });
      await refreshData();
    },
  });

  const handleRenew = useCallback(
    (campaign: BoostCenterCampaign) => {
      setMessage(null);
      openCheckout(campaign.listingId, campaign.position);
    },
    [openCheckout]
  );

  const actionLabel = (action: BoostHistoryAction) => {
    const map: Record<BoostHistoryAction, string> = {
      created: t.boost.actionCreated,
      activated: t.boost.actionActivated,
      outbid: t.boost.actionOutbid,
      position_changed: t.boost.actionPositionChanged,
      expired: t.boost.actionExpired,
      removed: t.boost.actionRemoved,
      cancelled: t.boost.actionCancelled,
      extended: t.boost.actionExtended,
      disabled: t.boost.actionDisabled,
    };
    return map[action];
  };

  return (
    <div className="space-y-8">
      {(message || checkoutError) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 text-sm ${
            message?.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message?.text ?? checkoutError}
        </motion.div>
      )}

      <BoostSection
        icon={Zap}
        title={t.boost.currentBoosts}
        empty={t.boost.noCurrentBoosts}
        items={data.active}
        renderItem={(campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            locale={locale}
            t={t}
            variant="active"
          />
        )}
      />

      <BoostSection
        icon={Hourglass}
        title={t.boost.processingBoosts}
        empty={t.boost.noProcessingBoosts}
        items={data.processing}
        hideWhenEmpty
        renderItem={(campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            locale={locale}
            t={t}
            variant="processing"
          />
        )}
      />

      <BoostSection
        icon={Sparkles}
        title={t.boost.upcomingBoosts}
        empty={t.boost.noUpcomingBoosts}
        items={data.upcoming}
        hideWhenEmpty
        renderItem={(campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            locale={locale}
            t={t}
            variant="upcoming"
          />
        )}
      />

      <BoostSection
        icon={Clock}
        title={t.boost.expiredBoosts}
        empty={t.boost.noExpiredBoosts}
        items={data.expired}
        renderItem={(campaign) => (
          <ExpiredCampaignCard
            key={campaign.id}
            campaign={campaign}
            locale={locale}
            t={t}
            isRenewing={isPreparing}
            onRenew={() => handleRenew(campaign)}
          />
        )}
      />

      <BoostSection
        icon={XCircle}
        title={t.boost.cancelledBoosts}
        empty={t.boost.noCancelledBoosts}
        items={data.cancelled}
        hideWhenEmpty
        renderItem={(campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            locale={locale}
            t={t}
            variant="cancelled"
          />
        )}
      />

      <section>
        <SectionHeader icon={CreditCard} title={t.boost.paymentHistory} />
        {data.payments.length === 0 ? (
          <EmptyPanel message={t.boost.noPayments} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {data.payments.map((payment, index) => (
              <PaymentHistoryCard key={payment.id} payment={payment} index={index} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader icon={History} title={t.boost.history} />
        {data.history.length === 0 ? (
          <EmptyPanel message={t.boost.noHistory} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-sm">
            <div className="divide-y divide-surface-100">
              {data.history.map((entry, index) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  locale={locale}
                  actionLabel={actionLabel(entry.action)}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <BoostCheckoutModal
        open={Boolean(checkout)}
        checkout={checkout}
        isPaying={isPaying}
        error={checkoutError}
        onClose={closeCheckout}
        onConfirmPayment={confirmPayment}
      />
    </div>
  );
}

function BoostSection<T extends { id: string }>({
  icon: Icon,
  title,
  empty,
  items,
  renderItem,
  hideWhenEmpty = false,
}: {
  icon: typeof Zap;
  title: string;
  empty: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
  hideWhenEmpty?: boolean;
}) {
  if (items.length === 0 && hideWhenEmpty) return null;

  return (
    <section>
      <SectionHeader icon={Icon} title={title} />
      {items.length === 0 ? (
        <EmptyPanel message={empty} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Zap; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-6 py-10 text-center text-sm text-surface-500">
      {message}
    </div>
  );
}

function CampaignCard({
  campaign,
  locale,
  t,
  variant,
}: {
  campaign: BoostCenterCampaign;
  locale: "fr" | "ar";
  t: ReturnType<typeof useTranslation>["t"];
  variant: "active" | "processing" | "upcoming" | "cancelled";
}) {
  const displayStatus = resolveCampaignDisplayStatus(campaign);
  const isActive = variant === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md ${
        isActive
          ? "border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50"
          : "border-surface-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              isActive ? "text-amber-700/80" : "text-surface-400"
            }`}
          >
            {campaign.productName}
          </p>
          <h3 className="mt-1 truncate font-semibold text-surface-900">{campaign.listingTitle}</h3>
          <p className="mt-1 text-sm text-surface-500">
            {t.boost.position.replace("{n}", String(campaign.position))}
          </p>
        </div>
        <BoostStatusBadge
          status={displayStatus}
          pulse={displayStatus === "processing"}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label={t.boost.amount} value={formatPrice(campaign.amount, undefined, locale)} />
        <Metric
          label={isActive ? t.boost.expiresIn : t.boost.expiredOn}
          value={
            isActive && campaign.expiresAt ? (
              <BoostCountdown expiresAt={campaign.expiresAt} compact variant="light" />
            ) : campaign.expiresAt ? (
              formatDate(campaign.expiresAt, locale)
            ) : campaign.startsAt ? (
              formatDate(campaign.startsAt, locale)
            ) : (
              "—"
            )
          }
        />
      </div>

      <Link
        href={`/properties/${campaign.listingId}`}
        className="mt-4 inline-flex text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
      >
        {t.dashboard.view}
      </Link>
    </motion.div>
  );
}

function ExpiredCampaignCard({
  campaign,
  locale,
  t,
  isRenewing,
  onRenew,
}: {
  campaign: BoostCenterCampaign;
  locale: "fr" | "ar";
  t: ReturnType<typeof useTranslation>["t"];
  isRenewing: boolean;
  onRenew: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">
            {campaign.productName}
          </p>
          <h3 className="mt-1 truncate font-semibold text-surface-900">{campaign.listingTitle}</h3>
          <p className="mt-1 text-sm text-surface-500">
            {t.boost.position.replace("{n}", String(campaign.position))}
          </p>
        </div>
        <BoostStatusBadge status="expired" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label={t.boost.amount} value={formatPrice(campaign.amount, undefined, locale)} />
        <Metric
          label={t.boost.expiredOn}
          value={campaign.expiresAt ? formatDate(campaign.expiresAt, locale) : "—"}
        />
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-4 transition-transform hover:-translate-y-0.5"
        isLoading={isRenewing}
        onClick={onRenew}
      >
        <RefreshCw className="h-4 w-4" />
        {t.boost.renew}
      </Button>
    </motion.div>
  );
}

function PaymentHistoryCard({
  payment,
  index,
}: {
  payment: BoostCenterPayment;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <BoostPaymentReceipt receipt={boostPaymentToReceipt(payment)} />
    </motion.div>
  );
}

function HistoryRow({
  entry,
  index,
  locale,
  actionLabel,
  t,
}: {
  entry: BoostCenterHistoryEntry;
  index: number;
  locale: "fr" | "ar";
  actionLabel: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-surface-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-surface-900">{entry.listingTitle}</p>
        <p className="mt-0.5 text-sm text-surface-500">
          {actionLabel}
          {entry.newPosition !== null &&
            ` · ${t.boost.position.replace("{n}", String(entry.newPosition))}`}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        <span className="font-semibold text-surface-700">
          {formatPrice(entry.amount, undefined, locale)}
        </span>
        <span className="text-surface-400">{formatDate(entry.createdAt, locale)}</span>
      </div>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-surface-800">{value}</div>
    </div>
  );
}
