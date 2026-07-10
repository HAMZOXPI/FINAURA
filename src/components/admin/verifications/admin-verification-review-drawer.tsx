"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Crown,
  FileImage,
  Mail,
  MessageSquare,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { fetchUserPromotionStatus } from "@/actions/admin-promotion.actions";
import type { AdminActivityItem } from "@/services/admin.service";
import type {
  AdminVerificationRequestRow,
  VerificationDocumentUrls,
} from "@/services/admin-verification.service";
import type { UserPromotionStatus } from "@/services/admin-promotion.service";
import {
  buildVerificationDocuments,
  getSellerLastActivityLabel,
  getSellerRelatedActivity,
} from "@/lib/admin/verification-review-drawer-display";
import { UserAvatar } from "@/components/admin/promotions/promotion-ui";
import { VerificationAccountSummary } from "@/components/admin/verifications/verification-account-summary";
import { VerificationActivityTimeline } from "@/components/admin/verifications/verification-activity-timeline";
import { VerificationDocumentCard } from "@/components/admin/verifications/verification-document-card";
import { VerificationModerationActions } from "@/components/admin/verifications/verification-moderation-actions";
import { VerificationQuickInsights } from "@/components/admin/verifications/verification-quick-insights";
import { VerificationReviewTimeline } from "@/components/admin/verifications/verification-review-timeline";
import { VerificationRiskPanel } from "@/components/admin/verifications/verification-risk-panel";
import { VerificationStatusCard } from "@/components/admin/verifications/verification-status-card";
import { VerificationSummaryCard } from "@/components/admin/verifications/verification-summary-card";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminVerificationReviewDrawerProps {
  request: AdminVerificationRequestRow | null;
  urls: VerificationDocumentUrls | null;
  documentsLoading: boolean;
  activity: AdminActivityItem[];
  isPending: boolean;
  onClose: () => void;
  onApprove: (requestId: string) => void;
  onReject: (request: AdminVerificationRequestRow) => void;
  onDownloadDocuments: (requestId: string, urls: VerificationDocumentUrls | null) => void;
}

function RequestStatusBadge({ status }: { status: AdminVerificationRequestRow["status"] }) {
  const { t } = useTranslation();
  const config = {
    pending: {
      label: t.admin.verifications.statusPending,
      className: "bg-orange-50 text-orange-700 ring-orange-200/80",
    },
    approved: {
      label: t.admin.verifications.statusApproved,
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
    },
    rejected: {
      label: t.admin.verifications.statusRejected,
      className: "bg-red-50 text-red-700 ring-red-200/80",
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {config.label}
    </span>
  );
}

export function AdminVerificationReviewDrawer({
  request,
  urls,
  documentsLoading,
  activity,
  isPending,
  onClose,
  onApprove,
  onReject,
  onDownloadDocuments,
}: AdminVerificationReviewDrawerProps) {
  const { t, locale } = useTranslation();
  const [promotionStatus, setPromotionStatus] = useState<UserPromotionStatus | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const isOpen = request !== null;
  const seller = request?.seller;
  const sellerId = seller?.id;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!sellerId) {
      setPromotionStatus(null);
      return;
    }

    setMetricsLoading(true);
    void fetchUserPromotionStatus(sellerId).then((result) => {
      if ("status" in result && result.status) {
        setPromotionStatus(result.status);
      } else {
        setPromotionStatus(null);
      }
      setMetricsLoading(false);
    });
  }, [sellerId]);

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

  const sellerActivity = useMemo(
    () => (request ? getSellerRelatedActivity(request, activity) : []),
    [request, activity]
  );

  const lastActivity = useMemo(
    () => (request ? getSellerLastActivityLabel(request, activity, locale) : null),
    [request, activity, locale]
  );

  const documents = useMemo(
    () =>
      buildVerificationDocuments(urls, Boolean(request?.proof_of_address)),
    [urls, request?.proof_of_address]
  );

  const documentLabels: Record<string, string> = {
    selfie: t.dashboard.verificationSelfie,
    idFront: t.dashboard.verificationIdFront,
    idBack: t.dashboard.verificationIdBack,
    proofOfAddress: t.dashboard.verificationProofOfAddress,
  };

  const boostCampaigns = promotionStatus
    ? promotionStatus.activeGifts.filter((gift) => gift.gift_type === "boost_credits").length
    : null;

  const verificationTone =
    request?.status === "approved"
      ? "success"
      : request?.status === "rejected"
        ? "danger"
        : "pending";

  const scrollToDocuments = () => {
    document.getElementById("verification-documents-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const slideProps = isDesktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } };

  return (
    <AnimatePresence>
      {isOpen && request && (
        <>
          <motion.button
            type="button"
            aria-label={t.admin.verifications.drawer.close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-review-drawer-title"
            {...slideProps}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className={cn(
              "fixed z-[90] flex flex-col bg-white shadow-2xl",
              "inset-0 lg:inset-y-0 lg:end-0 lg:start-auto lg:w-full lg:max-w-[680px]"
            )}
          >
            <div className="sticky top-0 z-20 border-b border-surface-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-4">
                  <UserAvatar
                    name={seller?.full_name}
                    email={seller?.email}
                    avatarUrl={seller?.avatar_url}
                    size="xl"
                  />
                  <div className="min-w-0">
                    <h2
                      id="verification-review-drawer-title"
                      className="truncate text-xl font-bold tracking-tight text-surface-900"
                    >
                      {seller?.full_name ?? seller?.email ?? "—"}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-surface-500">
                      {seller?.email ?? "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {promotionStatus?.isPremium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200/80">
                          <Star className="h-3 w-3" />
                          {promotionStatus.planName ?? t.admin.verifications.drawer.premiumBadge}
                        </span>
                      )}
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <p className="mt-2 text-xs text-surface-500">
                      {t.admin.verifications.drawer.submitted}:{" "}
                      {formatDate(request.created_at, locale)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 text-surface-600 transition-colors hover:bg-surface-50"
                  aria-label={t.admin.verifications.drawer.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="space-y-6">
                <VerificationQuickInsights
                  request={request}
                  isPremium={metricsLoading ? null : Boolean(promotionStatus?.isPremium)}
                  listingsCount={
                    metricsLoading || promotionStatus === null
                      ? null
                      : promotionStatus.listingsUsed
                  }
                  loading={metricsLoading || documentsLoading}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <VerificationReviewTimeline status={request.status} />
                  <VerificationSummaryCard request={request} locale={locale} />
                </div>

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6">
                  <section id="verification-documents-section" className="space-y-4 scroll-mt-4">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-brand-600" />
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                        {t.admin.verifications.drawer.documentsTitle}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {documents.map((document) => (
                        <VerificationDocumentCard
                          key={document.key}
                          document={document}
                          label={documentLabels[document.labelKey]}
                          loading={documentsLoading}
                        />
                      ))}
                    </div>
                  </section>

                  <div className="space-y-6">
                    <VerificationRiskPanel />

                    <VerificationAccountSummary
                      userId={seller?.id ?? "—"}
                      name={seller?.full_name ?? "—"}
                      email={seller?.email ?? "—"}
                      phone={seller?.phone ?? "—"}
                      lastActivity={lastActivity}
                      listingsCount={
                        metricsLoading || promotionStatus === null
                          ? null
                          : promotionStatus.listingsUsed
                      }
                      boostCampaigns={metricsLoading ? null : boostCampaigns}
                      metricsLoading={metricsLoading}
                    />

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                      {t.admin.verifications.drawer.accountStatusTitle}
                    </h3>
                    <div className="space-y-2 rounded-2xl border border-surface-200/80 bg-surface-50/40 p-3">
                      <VerificationStatusCard
                        icon={ShieldCheck}
                        title={t.admin.verifications.colStatus}
                        status={
                          request.status === "pending"
                            ? t.admin.verifications.statusPending
                            : request.status === "approved"
                              ? t.admin.verifications.statusApproved
                              : t.admin.verifications.statusRejected
                        }
                        description={t.admin.verifications.drawer.verificationDesc}
                        tone={verificationTone}
                      />
                      <VerificationStatusCard
                        icon={Star}
                        title={t.admin.verifications.drawer.premium}
                        status={
                          promotionStatus?.isPremium
                            ? promotionStatus.planName
                            : t.admin.verifications.drawer.notPremium
                        }
                        description={t.admin.verifications.drawer.premiumDesc}
                        tone={promotionStatus?.isPremium ? "success" : "neutral"}
                        unavailable={!metricsLoading && promotionStatus === null}
                      />
                      <VerificationStatusCard
                        icon={Crown}
                        title={t.admin.verifications.drawer.admin}
                        status={t.admin.verifications.comingSoon}
                        description={t.admin.verifications.drawer.adminDesc}
                        unavailable
                      />
                      <VerificationStatusCard
                        icon={Mail}
                        title={t.admin.verifications.drawer.emailVerified}
                        status={t.admin.verifications.comingSoon}
                        description={t.admin.verifications.drawer.emailVerifiedDesc}
                        unavailable
                      />
                      <VerificationStatusCard
                        icon={MessageSquare}
                        title={t.admin.verifications.drawer.phoneVerified}
                        status={t.admin.verifications.comingSoon}
                        description={t.admin.verifications.drawer.phoneVerifiedDesc}
                        unavailable
                      />
                      <VerificationStatusCard
                        icon={Ban}
                        title={t.admin.verifications.drawer.suspended}
                        status={t.admin.verifications.comingSoon}
                        description={t.admin.verifications.drawer.suspendedDesc}
                        unavailable
                      />
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                      {t.admin.verifications.drawer.recentActivityTitle}
                    </h3>
                    <VerificationActivityTimeline items={sellerActivity} />
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
                      {t.admin.verifications.drawer.notesTitle}
                    </h3>
                    <div className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm">
                      <Textarea
                        disabled
                        rows={4}
                        placeholder={t.admin.verifications.comingSoon}
                        className="cursor-not-allowed resize-none bg-surface-50/80 opacity-70"
                      />
                      <p className="mt-2 text-xs font-medium text-surface-400">
                        {t.admin.verifications.comingSoon}
                      </p>
                    </div>
                  </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-surface-100 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
              <VerificationModerationActions
                status={request.status}
                actionPending={isPending}
                downloadReady={!documentsLoading && Boolean(urls)}
                variant="drawer"
                handlers={{
                  onApprove: () => onApprove(request.id),
                  onReject: () => onReject(request),
                  onViewDocuments: scrollToDocuments,
                  onDownloadDocuments: () => onDownloadDocuments(request.id, urls),
                }}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
