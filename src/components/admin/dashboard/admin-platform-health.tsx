"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CheckCircle2,
  CircleDashed,
  Clock,
  Database,
  HardDrive,
  Mail,
  Radio,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import type { AdminBoostStats } from "@/services/admin-boost.service";
import type { AdminDashboardStats } from "@/services/admin.service";
import {
  HEALTH_STATE_STYLES,
  hasPlatformDataLoaded,
  type PlatformHealthState,
} from "@/lib/admin/platform-health-display";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminPlatformHealthProps {
  stats: AdminDashboardStats;
  boostStats: AdminBoostStats;
}

function StatusPulse({ className }: { className: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
          className
        )}
      />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", className)} />
    </span>
  );
}

function HealthBadge({
  state,
  label,
}: {
  state: PlatformHealthState;
  label: string;
}) {
  const styles = HEALTH_STATE_STYLES[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        styles.badge
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
      {label}
    </span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
      {children}
    </h3>
  );
}

function SystemStatusCard({
  icon: Icon,
  title,
  state,
  statusLabel,
  description,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  state: PlatformHealthState;
  statusLabel: string;
  description: string;
  delay: number;
}) {
  const styles = HEALTH_STATE_STYLES[state];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-50 text-surface-600 ring-1 ring-surface-200/70">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <HealthBadge state={state} label={statusLabel} />
      </div>
      <p className="mt-4 text-sm font-semibold text-surface-900">{title}</p>
      <p className={cn("mt-1 text-xs font-medium", styles.text)}>{statusLabel}</p>
      <p className="mt-2 text-xs leading-relaxed text-surface-500">{description}</p>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  unavailable = false,
  delay,
}: {
  label: string;
  value: ReactNode;
  unavailable?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-surface-200/70 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-xs font-medium text-surface-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tracking-tight",
          unavailable ? "text-surface-300" : "text-surface-900"
        )}
      >
        {value}
      </p>
    </motion.div>
  );
}

function StorageBar({
  label,
  unavailable,
  delay,
}: {
  label: string;
  unavailable?: boolean;
  delay: number;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-surface-700">{label}</span>
        <span className="font-semibold text-surface-400">
          {unavailable ? t.admin.platformHealth.comingSoon : "—"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-100">
        {unavailable ? (
          <div className="h-full w-full bg-gradient-to-r from-surface-100 via-surface-200/60 to-surface-100" />
        ) : (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "0%" }}
            className="h-full rounded-full bg-brand-500"
          />
        )}
      </div>
    </motion.div>
  );
}

export function AdminPlatformHealth({ stats, boostStats }: AdminPlatformHealthProps) {
  const { t } = useTranslation();
  const dataLoaded = hasPlatformDataLoaded(stats);

  const systemCards = [
    {
      icon: Server,
      title: t.admin.platformHealth.systemApi,
      state: (dataLoaded ? "operational" : "unavailable") as PlatformHealthState,
      statusLabel: dataLoaded
        ? t.admin.platformHealth.statusOperational
        : t.admin.platformHealth.statusUnavailable,
      description: dataLoaded
        ? t.admin.platformHealth.systemApiDescOk
        : t.admin.platformHealth.systemApiDescPending,
      delay: 0.78,
    },
    {
      icon: Database,
      title: t.admin.platformHealth.systemDatabase,
      state: (dataLoaded ? "operational" : "unavailable") as PlatformHealthState,
      statusLabel: dataLoaded
        ? t.admin.platformHealth.statusOperational
        : t.admin.platformHealth.statusUnavailable,
      description: dataLoaded
        ? t.admin.platformHealth.systemDatabaseDescOk
        : t.admin.platformHealth.systemDatabaseDescPending,
      delay: 0.82,
    },
    {
      icon: HardDrive,
      title: t.admin.platformHealth.systemStorage,
      state: "unavailable" as PlatformHealthState,
      statusLabel: t.admin.platformHealth.statusUnavailable,
      description: t.admin.platformHealth.systemStorageDesc,
      delay: 0.86,
    },
    {
      icon: Radio,
      title: t.admin.platformHealth.systemRealtime,
      state: "unavailable" as PlatformHealthState,
      statusLabel: t.admin.platformHealth.comingSoon,
      description: t.admin.platformHealth.systemRealtimeDesc,
      delay: 0.9,
    },
    {
      icon: Clock,
      title: t.admin.platformHealth.systemCron,
      state: "unavailable" as PlatformHealthState,
      statusLabel: t.admin.platformHealth.comingSoon,
      description: t.admin.platformHealth.systemCronDesc,
      delay: 0.94,
    },
    {
      icon: Mail,
      title: t.admin.platformHealth.systemEmail,
      state: "unavailable" as PlatformHealthState,
      statusLabel: t.admin.platformHealth.comingSoon,
      description: t.admin.platformHealth.systemEmailDesc,
      delay: 0.98,
    },
  ];

  const securityRows = [
    {
      title: t.admin.platformHealth.securitySsl,
      status: t.admin.platformHealth.securityProtected,
      description: t.admin.platformHealth.securitySslDesc,
      ok: true,
    },
    {
      title: t.admin.platformHealth.securityAuth,
      status: t.admin.platformHealth.securityHealthy,
      description: t.admin.platformHealth.securityAuthDesc,
      ok: true,
    },
    {
      title: t.admin.platformHealth.securityRateLimit,
      status: t.admin.platformHealth.comingSoon,
      description: t.admin.platformHealth.securityRateLimitDesc,
      ok: false,
    },
    {
      title: t.admin.platformHealth.securityBackups,
      status: t.admin.platformHealth.comingSoon,
      description: t.admin.platformHealth.securityBackupsDesc,
      ok: false,
    },
    {
      title: t.admin.platformHealth.securityAdmin,
      status: t.admin.platformHealth.securityHealthy,
      description: t.admin.platformHealth.securityAdminDesc,
      ok: true,
    },
  ];

  const liveUserMetrics = [
    { label: t.admin.platformHealth.liveOnlineUsers, unavailable: true },
    { label: t.admin.platformHealth.liveVisitors, unavailable: true },
    { label: t.admin.platformHealth.liveNewAccounts, unavailable: true },
    { label: t.admin.platformHealth.liveSessions, unavailable: true },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.74 }}
      className="space-y-6"
    >
      <div className="overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 border-b border-surface-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              <span aria-hidden>🟢</span>
              {t.admin.platformHealth.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-surface-500">
              {t.admin.platformHealth.subtitle}
            </p>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <StatusPulse className="bg-emerald-500" />
            {t.admin.platformHealth.allOperational}
          </span>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-6">
          <div className="space-y-4">
            <SectionTitle>{t.admin.platformHealth.systemStatusTitle}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {systemCards.map((card) => (
                <SystemStatusCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t.admin.platformHealth.metricsTitle}</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label={t.admin.platformHealth.metricResponseTime}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.02}
              />
              <MetricCard
                label={t.admin.platformHealth.metricApiRequests}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.04}
              />
              <MetricCard
                label={t.admin.platformHealth.metricImagesUploaded}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.06}
              />
              <MetricCard
                label={t.admin.platformHealth.metricMessagesToday}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.08}
              />
              <MetricCard
                label={t.admin.platformHealth.metricSearchRequests}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.1}
              />
              <MetricCard
                label={t.admin.platformHealth.metricStorageUsage}
                value={t.admin.platformHealth.comingSoon}
                unavailable
                delay={1.12}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label={t.admin.totalUsers}
                value={<AnimatedCounter value={stats.totalUsers} />}
                delay={1.14}
              />
              <MetricCard
                label={t.admin.totalMessages}
                value={<AnimatedCounter value={stats.totalMessages} />}
                delay={1.16}
              />
              <MetricCard
                label={t.admin.activeListings}
                value={<AnimatedCounter value={stats.activeListings} />}
                delay={1.18}
              />
              <MetricCard
                label={t.admin.kpiActiveBoosts}
                value={<AnimatedCounter value={boostStats.activeBoosts} />}
                delay={1.2}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.22, duration: 0.32 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <SectionTitle>{t.admin.platformHealth.securityTitle}</SectionTitle>
              </div>
              <ul className="mt-4 space-y-3">
                {securityRows.map((row, index) => (
                  <motion.li
                    key={row.title}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.24 + index * 0.04 }}
                    className="flex items-start gap-3 rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-3"
                  >
                    {row.ok ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-surface-900">{row.title}</p>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            row.ok ? "text-emerald-700" : "text-surface-400"
                          )}
                        >
                          {row.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-surface-500">{row.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.26, duration: 0.32 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <SectionTitle>{t.admin.platformHealth.liveUsersTitle}</SectionTitle>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {liveUserMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-3"
                  >
                    <p className="text-xs font-medium text-surface-500">{metric.label}</p>
                    <p className="mt-1 text-base font-bold text-surface-300">
                      {t.admin.platformHealth.comingSoon}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-surface-400">
                {t.admin.platformHealth.liveUsersHint.replace(
                  "{count}",
                  String(stats.totalUsers)
                )}
              </p>
            </motion.div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.32 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <SectionTitle>{t.admin.platformHealth.storageTitle}</SectionTitle>
              </div>
              <div className="mt-4 space-y-4">
                <StorageBar label={t.admin.platformHealth.storageImages} unavailable delay={1.32} />
                <StorageBar
                  label={t.admin.platformHealth.storageDocuments}
                  unavailable
                  delay={1.34}
                />
                <StorageBar
                  label={t.admin.platformHealth.storageDatabase}
                  unavailable
                  delay={1.36}
                />
                <StorageBar label={t.admin.platformHealth.storageTotal} unavailable delay={1.38} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.32 }}
              className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-brand-600" strokeWidth={2} />
                <SectionTitle>{t.admin.platformHealth.performanceTitle}</SectionTitle>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  t.admin.platformHealth.perfPageLoad,
                  t.admin.platformHealth.perfApiResponse,
                  t.admin.platformHealth.perfServer,
                  t.admin.platformHealth.perfCache,
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-surface-100 bg-surface-50/50 px-3 py-3"
                  >
                    <p className="text-xs font-medium text-surface-500">{label}</p>
                    <p className="mt-1 text-base font-bold text-surface-300">
                      {t.admin.platformHealth.comingSoon}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-4">
            <SectionTitle>{t.admin.platformHealth.eventsTitle}</SectionTitle>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.42, duration: 0.32 }}
              className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-6 py-10 text-center"
            >
              <Activity className="mx-auto h-8 w-8 text-surface-300" strokeWidth={1.75} />
              <p className="mt-4 text-sm font-semibold text-surface-900">
                {t.admin.platformHealth.eventsEmptyTitle}
              </p>
              <p className="mt-1 text-xs text-surface-500">
                {t.admin.platformHealth.eventsEmptySubtitle}
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.44, duration: 0.35 }}
          className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/60 px-5 py-5 sm:px-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-base font-bold text-emerald-800">
                <span aria-hidden>🟢</span>
                {t.admin.platformHealth.footerTitle}
              </p>
              <p className="mt-1 text-sm text-emerald-700/80">
                {t.admin.platformHealth.footerSubtitle}
              </p>
            </div>
            <HealthBadge
              state="operational"
              label={t.admin.platformHealth.statusOperational}
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
