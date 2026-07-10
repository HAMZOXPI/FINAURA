"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  CheckCircle2,
  CircleDashed,
  Crown,
  ExternalLink,
  Mail,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { fetchUserPromotionStatus } from "@/actions/admin-promotion.actions";
import type { AdminActivityItem } from "@/services/admin.service";
import type { UserPromotionStatus } from "@/services/admin-promotion.service";
import type { AdminUsersTableRow } from "@/lib/admin/users-display";
import { isPremiumUser } from "@/lib/admin/users-display";
import {
  getLastActivityLabel,
  getUserRelatedActivity,
  mapActivityToDrawerEvent,
} from "@/lib/admin/user-drawer-display";
import { AnimatedCounter } from "@/components/admin/promotions/promotion-ui";
import { UserAvatar } from "@/components/admin/promotions/promotion-ui";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

function formatActivityRelativeTimeSafe(dateString: string, locale: string, labels: {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  yesterday: string;
  daysAgo: string;
}): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return labels.justNow;
  if (diffMins < 60) return labels.minutesAgo.replace("{count}", String(diffMins));
  if (diffHours < 24) return labels.hoursAgo.replace("{count}", String(diffHours));
  if (diffDays === 1) return labels.yesterday;
  if (diffDays < 7) return labels.daysAgo.replace("{count}", String(diffDays));

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-MA" : "fr-FR", {
    month: "short",
    day: "numeric",
  }).format(date);
}

interface AdminUserDetailsDrawerProps {
  user: AdminUsersTableRow | null;
  activity: AdminActivityItem[];
  onClose: () => void;
}

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

function StatusRow({
  icon: Icon,
  title,
  status,
  description,
  ok,
}: {
  icon: typeof CheckCircle2;
  title: string;
  status: string;
  description: string;
  ok: boolean | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white px-3 py-3">
      {ok === true ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : ok === false ? (
        <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
      ) : (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-surface-900">{title}</p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
              ok === true
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                : ok === false
                  ? "bg-surface-100 text-surface-500 ring-surface-200/80"
                  : "bg-orange-50 text-orange-700 ring-orange-200/80"
            )}
          >
            {status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-surface-500">{description}</p>
      </div>
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
            {t.admin.users.comingSoon}
          </span>
        ) : (
          <AnimatedCounter value={value} />
        )}
      </p>
    </motion.div>
  );
}

function DisabledQuickAction({
  icon: Icon,
  label,
  variant = "default",
}: {
  icon: typeof ExternalLink;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        "inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold opacity-60",
        variant === "danger"
          ? "border-red-200 bg-red-50/50 text-red-400"
          : "border-surface-200 bg-white text-surface-400"
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}

export function AdminUserDetailsDrawer({ user, activity, onClose }: AdminUserDetailsDrawerProps) {
  const { t, locale } = useTranslation();
  const [promotionStatus, setPromotionStatus] = useState<UserPromotionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const isOpen = user !== null;
  const premium = user ? isPremiumUser(user) : false;
  const userActivity = user ? getUserRelatedActivity(user, activity) : [];
  const lastActivity = user ? getLastActivityLabel(user, activity, locale) : null;

  useEffect(() => {
    if (!user) {
      setPromotionStatus(null);
      return;
    }

    setLoading(true);
    void fetchUserPromotionStatus(user.id).then((result) => {
      if ("status" in result && result.status) {
        setPromotionStatus(result.status);
      } else {
        setPromotionStatus(null);
      }
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const boostCredits = promotionStatus
    ? promotionStatus.activeGifts.filter((gift) => gift.gift_type === "boost_credits").length
    : null;

  const activityLabels = {
    joined: t.admin.users.drawer.eventJoined,
    listing: t.admin.users.drawer.eventListing,
    verification: t.admin.users.drawer.eventVerification,
    message: t.admin.users.drawer.eventMessage,
  };

  const timeLabels = {
    justNow: t.admin.activity.justNow,
    minutesAgo: t.admin.activity.minutesAgo,
    hoursAgo: t.admin.activity.hoursAgo,
    yesterday: t.admin.activity.yesterday,
    daysAgo: t.admin.activity.daysAgo,
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <>
          <motion.button
            type="button"
            aria-label={t.admin.users.drawer.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={cn(
              "fixed inset-y-0 end-0 z-[70] flex w-full flex-col bg-white shadow-2xl",
              "max-w-full sm:max-w-[540px]"
            )}
          >
            <div className="sticky top-0 z-10 border-b border-surface-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-4">
                  <UserAvatar
                    name={user.full_name}
                    email={user.email}
                    avatarUrl={user.avatar_url}
                    size="xl"
                  />
                  <div className="min-w-0">
                    <h2
                      id="admin-user-drawer-title"
                      className="truncate text-xl font-bold tracking-tight text-surface-900"
                    >
                      {user.full_name || user.email}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-surface-500">{user.email}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-600 ring-1 ring-surface-200/80">
                        {t.admin.users.unavailable}
                      </span>
                      {premium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                          <Star className="h-3 w-3" />
                          {t.admin.users.badgePremium}
                        </span>
                      )}
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200/80">
                        {t.admin.users.unavailable}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
                      <span>
                        {t.admin.users.colJoined}:{" "}
                        {user.created_at
                          ? formatDate(user.created_at, locale)
                          : t.admin.users.unavailable}
                      </span>
                      {lastActivity && (
                        <span>
                          {t.admin.users.drawer.lastActivity}: {lastActivity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50"
                  aria-label={t.admin.users.drawer.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="space-y-8">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.profileTitle}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ProfileField label={t.admin.users.drawer.userId} value={user.id} />
                    <ProfileField
                      label={t.admin.users.colName}
                      value={user.full_name || "—"}
                    />
                    <ProfileField label={t.admin.users.colEmail} value={user.email || "—"} />
                    <ProfileField label={t.admin.users.drawer.phone} value="—" />
                    <ProfileField label={t.admin.users.drawer.country} value="—" />
                    <ProfileField label={t.admin.users.drawer.city} value="—" />
                    <ProfileField label={t.admin.users.drawer.language} value="—" />
                    <ProfileField
                      label={t.admin.users.drawer.created}
                      value={
                        user.created_at
                          ? formatDate(user.created_at, locale)
                          : "—"
                      }
                    />
                    <ProfileField label={t.admin.users.drawer.updated} value="—" />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.accountStatusTitle}
                  </h3>
                  <div className="space-y-2 rounded-2xl border border-surface-200/80 bg-surface-50/40 p-3">
                    <StatusRow
                      icon={ShieldCheck}
                      title={t.admin.users.colVerification}
                      status={t.admin.users.unavailable}
                      description={t.admin.users.drawer.verificationDesc}
                      ok={null}
                    />
                    <StatusRow
                      icon={Star}
                      title={t.admin.users.colPremium}
                      status={
                        premium
                          ? promotionStatus?.planName ?? t.admin.users.badgePremium
                          : t.admin.users.drawer.notPremium
                      }
                      description={t.admin.users.drawer.premiumDesc}
                      ok={premium}
                    />
                    <StatusRow
                      icon={Crown}
                      title={t.admin.users.filterAdmins}
                      status={t.admin.users.comingSoon}
                      description={t.admin.users.drawer.adminDesc}
                      ok={false}
                    />
                    <StatusRow
                      icon={Ban}
                      title={t.admin.users.filterSuspended}
                      status={t.admin.users.comingSoon}
                      description={t.admin.users.drawer.suspendedDesc}
                      ok={false}
                    />
                    <StatusRow
                      icon={Mail}
                      title={t.admin.users.drawer.emailVerified}
                      status={t.admin.users.comingSoon}
                      description={t.admin.users.drawer.emailVerifiedDesc}
                      ok={false}
                    />
                    <StatusRow
                      icon={MessageSquare}
                      title={t.admin.users.drawer.phoneVerified}
                      status={t.admin.users.comingSoon}
                      description={t.admin.users.drawer.phoneVerifiedDesc}
                      ok={false}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.platformActivityTitle}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <ActivityMetric
                      label={t.admin.users.colListings}
                      value={loading || promotionStatus === null ? null : promotionStatus.listingsUsed}
                      unavailable={!loading && promotionStatus === null}
                    />
                    <ActivityMetric
                      label={t.admin.users.colBoosts}
                      value={loading || boostCredits === null ? null : boostCredits}
                      unavailable={!loading && boostCredits === null}
                    />
                    <ActivityMetric label={t.admin.users.drawer.messages} value={null} unavailable />
                    <ActivityMetric label={t.admin.users.drawer.favorites} value={null} unavailable />
                    <ActivityMetric label={t.admin.users.drawer.reports} value={null} unavailable />
                    <ActivityMetric label={t.admin.users.drawer.views} value={null} unavailable />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.recentActivityTitle}
                  </h3>
                  {userActivity.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-4 py-10 text-center">
                      <p className="text-sm font-semibold text-surface-900">
                        {t.admin.users.drawer.activityEmptyTitle}
                      </p>
                      <p className="mt-1 text-xs text-surface-500">
                        {t.admin.users.drawer.activityEmptySubtitle}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {userActivity.map((item, index) => {
                        const event = mapActivityToDrawerEvent(item, activityLabels);
                        return (
                          <motion.li
                            key={item.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white px-3 py-3 shadow-sm"
                          >
                            <span className="text-lg" aria-hidden>
                              {event.emoji}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-surface-900">{event.title}</p>
                              <p className="mt-0.5 truncate text-xs text-surface-500">
                                {event.subtitle}
                              </p>
                            </div>
                            <time className="shrink-0 text-[11px] font-medium text-surface-400">
                              {formatActivityRelativeTimeSafe(item.createdAt, locale, timeLabels)}
                            </time>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.quickActionsTitle}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <DisabledQuickAction
                      icon={ExternalLink}
                      label={t.admin.users.drawer.viewProfile}
                    />
                    <DisabledQuickAction icon={Pencil} label={t.admin.users.actionEdit} />
                    <DisabledQuickAction icon={ShieldCheck} label={t.admin.users.actionVerify} />
                    <DisabledQuickAction icon={Crown} label={t.admin.users.drawer.grantPremium} />
                    <DisabledQuickAction icon={Ban} label={t.admin.users.actionSuspend} />
                    <DisabledQuickAction
                      icon={Trash2}
                      label={t.admin.users.actionDelete}
                      variant="danger"
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                    {t.admin.users.drawer.notesTitle}
                  </h3>
                  <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/50 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-surface-400">
                      {t.admin.users.comingSoon}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
