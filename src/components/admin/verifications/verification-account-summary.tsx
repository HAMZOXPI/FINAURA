"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { useTranslation } from "@/i18n/locale-provider";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-surface-900">{value}</p>
    </div>
  );
}

function ActivityMetric({
  label,
  value,
  unavailable,
}: {
  label: string;
  value: number | null;
  unavailable?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-surface-200/70 bg-white p-3 shadow-sm"
    >
      <p className="text-xs font-medium text-surface-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-surface-900">
        {unavailable || value === null ? (
          <span className="text-sm font-semibold text-surface-300">
            {t.admin.verifications.comingSoon}
          </span>
        ) : (
          <AnimatedCounter value={value} />
        )}
      </p>
    </motion.div>
  );
}

interface VerificationAccountSummaryProps {
  userId: string;
  name: string;
  email: string;
  phone: string;
  lastActivity: string | null;
  listingsCount: number | null;
  boostCampaigns: number | null;
  metricsLoading: boolean;
}

export function VerificationAccountSummary({
  userId,
  name,
  email,
  phone,
  lastActivity,
  listingsCount,
  boostCampaigns,
  metricsLoading,
}: VerificationAccountSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
          {t.admin.verifications.drawer.sellerInfoTitle}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileField label={t.admin.verifications.drawer.userId} value={userId} />
          <ProfileField label={t.admin.verifications.fieldName} value={name} />
          <ProfileField label={t.admin.verifications.fieldEmail} value={email} />
          <ProfileField label={t.admin.verifications.fieldPhone} value={phone} />
          <ProfileField label={t.admin.verifications.drawer.country} value="—" />
          <ProfileField label={t.admin.verifications.drawer.city} value="—" />
          <ProfileField label={t.admin.verifications.drawer.language} value="—" />
          <ProfileField label={t.admin.verifications.drawer.joinedDate} value="—" />
          <ProfileField
            label={t.admin.verifications.drawer.lastActivity}
            value={lastActivity ?? "—"}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
          {t.admin.verifications.drawer.platformActivityTitle}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ActivityMetric
            label={t.admin.verifications.drawer.listings}
            value={metricsLoading ? null : listingsCount}
            unavailable={!metricsLoading && listingsCount === null}
          />
          <ActivityMetric
            label={t.admin.verifications.drawer.boostCampaigns}
            value={metricsLoading ? null : boostCampaigns}
            unavailable={!metricsLoading && boostCampaigns === null}
          />
          <ActivityMetric
            label={t.admin.verifications.drawer.messages}
            value={null}
            unavailable
          />
          <ActivityMetric
            label={t.admin.verifications.drawer.reports}
            value={null}
            unavailable
          />
          <ActivityMetric
            label={t.admin.verifications.drawer.favorites}
            value={null}
            unavailable
          />
          <ActivityMetric
            label={t.admin.verifications.drawer.views}
            value={null}
            unavailable
          />
        </div>
      </section>
    </div>
  );
}
