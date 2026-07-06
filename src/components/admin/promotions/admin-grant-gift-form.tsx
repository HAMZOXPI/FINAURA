"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  Gift,
  Sparkles,
  User,
} from "lucide-react";
import { grantAdminGift, searchUsersForGift } from "@/actions/admin-promotion.actions";
import { PREFILL_KEY } from "@/components/admin/promotions/admin-active-promotions-table";
import { AdminPromotionUserSearch } from "@/components/admin/promotions/admin-promotion-user-search";
import { AdminPromotionUserStatus } from "@/components/admin/promotions/admin-promotion-user-status";
import {
  AdminPromotionToast,
  type ToastState,
  useGiftTypeBenefits,
  useGiftTypeDescription,
  useGiftTypeLabel,
  usePaymentSourceLabel,
} from "@/components/admin/promotions/promotion-shared";
import {
  CollapsibleSection,
  FieldHelper,
  FieldLabel,
  GiftTypeSelectCard,
  LivePreviewPanel,
  PAYMENT_SOURCE_ICONS,
  PreviewRow,
  PremiumCard,
  RECOMMENDED_GIFT_TYPES,
  UserAvatar,
} from "@/components/admin/promotions/promotion-ui";
import { GIFT_TYPE_CONFIG, PAYMENT_SOURCES, PROMOTION_UI_GIFT_TYPES } from "@/lib/gifts/constants";
import type { AdminGiftRecipient } from "@/services/admin-promotion.service";
import type { AdminGiftPaymentSource, AdminGiftType } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

function computePreviewExpiration(durationDays: string, expiresAt: string): string | null {
  if (expiresAt) {
    const date = new Date(expiresAt);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  const days = Number(durationDays);
  if (days > 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }
  return null;
}

export function AdminGrantGiftForm() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const giftTypeLabel = useGiftTypeLabel();
  const giftTypeDescription = useGiftTypeDescription();
  const giftTypeBenefits = useGiftTypeBenefits();
  const paymentSourceLabel = usePaymentSourceLabel();
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<ToastState>(null);

  const [selectedUser, setSelectedUser] = useState<AdminGiftRecipient | null>(null);
  const [giftType, setGiftType] = useState<AdminGiftType>("extra_listing_credits");
  const [quantity, setQuantity] = useState("1");
  const [durationDays, setDurationDays] = useState("30");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentSource, setPaymentSource] = useState<AdminGiftPaymentSource>("gift");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const giftConfig = GIFT_TYPE_CONFIG[giftType];
  const isUnlimitedGift = giftType === "unlimited_listings";

  useEffect(() => {
    const applyPrefill = async () => {
      const raw = sessionStorage.getItem(PREFILL_KEY);
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as { userId?: string; giftType?: AdminGiftType };
        sessionStorage.removeItem(PREFILL_KEY);
        if (data.giftType) setGiftType(data.giftType);
        if (data.userId) {
          const result = await searchUsersForGift(data.userId);
          if ("users" in result && result.users?.[0]) setSelectedUser(result.users[0]);
        }
      } catch {
        sessionStorage.removeItem(PREFILL_KEY);
      }
    };
    void applyPrefill();
    window.addEventListener("promotion-prefill", applyPrefill);
    return () => window.removeEventListener("promotion-prefill", applyPrefill);
  }, []);

  const previewExpiration = useMemo(
    () =>
      giftConfig.needsDuration || giftConfig.optionalDuration
        ? computePreviewExpiration(durationDays, expiresAt)
        : null,
    [durationDays, expiresAt, giftConfig.needsDuration, giftConfig.optionalDuration]
  );

  const willBecomePremium =
    giftType === "premium_subscription" ||
    giftType === "premium_extension" ||
    selectedUser?.plan_slug === "pro" ||
    selectedUser?.plan_slug === "enterprise";

  const effectAfterActivation = useMemo(() => {
    if (giftType === "unlimited_listings") return t.admin.promotions.effectUnlimited;
    if (giftType.includes("premium")) return t.admin.promotions.premiumActive;
    if (giftType === "extra_listing_credits") return t.admin.promotions.effectExtraCredits;
    return giftTypeLabel(giftType);
  }, [giftType, giftTypeLabel, t]);

  const resetForm = () => {
    setSelectedUser(null);
    setNotes("");
    setCustomTitle("");
    setCustomDescription("");
    setShowConfirm(false);
  };

  const handleOpenConfirm = () => {
    if (!selectedUser) {
      setToast({ type: "error", message: t.admin.promotions.selectUserError });
      return;
    }
    if (giftType === "custom_gift" && !customTitle.trim()) {
      setToast({ type: "error", message: t.admin.promotions.customTitleRequired });
      return;
    }
    setShowConfirm(true);
  };

  const handleGrant = () => {
    if (!selectedUser) return;

    startTransition(async () => {
      const result = await grantAdminGift({
        userId: selectedUser.id,
        giftType,
        quantity: giftConfig.needsQuantity ? Number(quantity) : null,
        durationDays:
          giftConfig.needsDuration || giftConfig.optionalDuration ? Number(durationDays) || null : null,
        expiresAt: expiresAt || null,
        notes,
        paymentSource,
        premiumPlanSlug: "pro",
        customTitle: giftType === "custom_gift" ? customTitle : null,
        customDescription: giftType === "custom_gift" ? customDescription : null,
      });

      if (result?.error) {
        setToast({ type: "error", message: result.error });
        return;
      }

      let message: string = t.admin.promotions.grantSuccess;
      if (result.couponCode) message = `${message} (${result.couponCode})`;

      setShowConfirm(false);
      setToast({ type: "success", message });
      resetForm();
      router.refresh();
    });
  };

  return (
    <>
      <AdminPromotionToast toast={toast} onClose={() => setToast(null)} />

      <div className="grid gap-8 xl:grid-cols-5" id="grant-promotion">
        <PremiumCard className="xl:col-span-3" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-500/25">
              <Gift className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-surface-900">
                {t.admin.promotions.grantTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-surface-500 sm:text-base">
                {t.admin.promotions.grantSubtitle}
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-10">
            <AdminPromotionUserSearch selectedUser={selectedUser} onSelect={setSelectedUser} />
            <AdminPromotionUserStatus userId={selectedUser?.id ?? null} />

            <div>
              <FieldLabel>{t.admin.promotions.fieldGiftType}</FieldLabel>
              <FieldHelper>{t.admin.promotions.giftTypeHint}</FieldHelper>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {PROMOTION_UI_GIFT_TYPES.map((type) => (
                  <GiftTypeSelectCard
                    key={type}
                    type={type}
                    selected={giftType === type}
                    title={giftTypeLabel(type)}
                    description={giftTypeDescription(type)}
                    benefits={giftTypeBenefits(type)}
                    recommendedLabel={
                      RECOMMENDED_GIFT_TYPES.includes(type)
                        ? t.admin.promotions.recommendedBadge
                        : undefined
                    }
                    onSelect={() => setGiftType(type)}
                  />
                ))}
              </div>
            </div>

            <CollapsibleSection
              id="advanced-settings"
              title={t.admin.promotions.advancedSettingsTitle}
              subtitle={t.admin.promotions.advancedSettingsSubtitle}
              defaultOpen={false}
            >
              {giftConfig.needsQuantity && (
                <div>
                  <FieldLabel htmlFor="quantity">{t.admin.promotions.fieldQuantity}</FieldLabel>
                  <FieldHelper>{t.admin.promotions.quantityHelper}</FieldHelper>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="mt-2 h-11 rounded-xl"
                  />
                </div>
              )}

              {(giftConfig.needsDuration || giftConfig.optionalDuration) && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="duration_days">{t.admin.promotions.fieldDuration}</FieldLabel>
                    <FieldHelper>{t.admin.promotions.durationHelper}</FieldHelper>
                    <Input
                      id="duration_days"
                      type="number"
                      min={1}
                      value={durationDays}
                      onChange={(event) => setDurationDays(event.target.value)}
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="expires_at">{t.admin.promotions.fieldExpiration}</FieldLabel>
                    <FieldHelper>{t.admin.promotions.expirationHelper}</FieldHelper>
                    <Input
                      id="expires_at"
                      type="date"
                      value={expiresAt}
                      onChange={(event) => setExpiresAt(event.target.value)}
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {giftType === "custom_gift" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel htmlFor="custom_title">{t.admin.promotions.fieldCustomTitle}</FieldLabel>
                    <FieldHelper>{t.admin.promotions.customTitleHelper}</FieldHelper>
                    <Input
                      id="custom_title"
                      value={customTitle}
                      onChange={(event) => setCustomTitle(event.target.value)}
                      className="mt-2 h-11 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="custom_description">
                      {t.admin.promotions.fieldCustomDescription}
                    </FieldLabel>
                    <Textarea
                      id="custom_description"
                      value={customDescription}
                      onChange={(event) => setCustomDescription(event.target.value)}
                      className="mt-2 min-h-[88px] rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div>
                <FieldLabel>{t.admin.promotions.fieldPaymentSource}</FieldLabel>
                <FieldHelper>{t.admin.promotions.paymentSourceHelper}</FieldHelper>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PAYMENT_SOURCES.map((source) => {
                    const Icon = PAYMENT_SOURCE_ICONS[source];
                    const selected = paymentSource === source;
                    return (
                      <button
                        key={source}
                        type="button"
                        title={paymentSourceLabel(source)}
                        aria-pressed={selected}
                        onClick={() => setPaymentSource(source)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                          selected
                            ? "border-brand-500 bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-500/30"
                            : "border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {paymentSourceLabel(source)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel htmlFor="notes">{t.admin.promotions.fieldNotes}</FieldLabel>
                <FieldHelper>{t.admin.promotions.notesHelper}</FieldHelper>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t.admin.promotions.notesPlaceholder}
                  className="mt-2 min-h-[100px] rounded-xl border-surface-200 bg-surface-50/30 focus:bg-white"
                />
              </div>
            </CollapsibleSection>
          </div>

          <div className="mt-10 hidden justify-end border-t border-surface-100 pt-8 lg:flex">
            <Button
              type="button"
              size="lg"
              isLoading={isPending}
              onClick={handleOpenConfirm}
              className="gap-2 rounded-xl px-8 shadow-lg shadow-brand-500/20"
            >
              <Sparkles className="h-4 w-4" />
              {t.admin.promotions.grantButton}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </PremiumCard>

        <div className="xl:col-span-2">
          <LivePreviewPanel title={t.admin.promotions.summaryTitle}>
            {selectedUser ? (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-surface-50 p-3 ring-1 ring-surface-100">
                <UserAvatar
                  name={selectedUser.full_name}
                  email={selectedUser.email}
                  avatarUrl={selectedUser.avatar_url}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-surface-900">
                    {selectedUser.full_name || selectedUser.email}
                  </p>
                  <p className="truncate text-xs text-surface-500">{selectedUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-dashed border-surface-200 p-3 text-surface-400">
                <User className="h-5 w-5" />
                <span className="text-sm">{t.admin.promotions.previewNoUser}</span>
              </div>
            )}

            <dl className="divide-y divide-surface-100">
              <PreviewRow label={t.admin.promotions.fieldGiftType}>{giftTypeLabel(giftType)}</PreviewRow>
              {giftConfig.needsQuantity && (
                <PreviewRow label={t.admin.promotions.fieldQuantity}>{quantity}</PreviewRow>
              )}
              {(giftConfig.needsDuration || giftConfig.optionalDuration) && durationDays && (
                <PreviewRow label={t.admin.promotions.fieldDuration}>
                  {durationDays} {t.admin.promotions.daysUnit}
                </PreviewRow>
              )}
              {previewExpiration && (
                <PreviewRow label={t.admin.promotions.fieldExpiration}>
                  {formatDate(previewExpiration, locale)}
                </PreviewRow>
              )}
              <PreviewRow label={t.admin.promotions.fieldPaymentSource}>
                {paymentSourceLabel(paymentSource)}
              </PreviewRow>
              <PreviewRow label={t.admin.promotions.currentPlan}>
                {selectedUser?.plan_name ?? "—"}
              </PreviewRow>
              <PreviewRow label={t.admin.promotions.summaryWillBecome} highlight>
                {willBecomePremium || giftType.includes("premium")
                  ? t.admin.promotions.premiumActive
                  : selectedUser?.plan_name ?? "—"}
              </PreviewRow>
              <PreviewRow label={t.admin.promotions.previewEffectAfter} highlight>
                {effectAfterActivation}
              </PreviewRow>
              <PreviewRow label={t.admin.promotions.summaryNotification}>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <Bell className="h-3.5 w-3.5" />
                  {t.admin.promotions.summaryNotificationYes}
                </span>
              </PreviewRow>
            </dl>
          </LivePreviewPanel>
        </div>
      </div>

      {/* Mobile sticky action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200/80 bg-white/95 p-4 backdrop-blur-md lg:hidden">
        <Button
          type="button"
          size="lg"
          isLoading={isPending}
          onClick={handleOpenConfirm}
          className="w-full gap-2 rounded-xl shadow-lg shadow-brand-500/20"
        >
          <Sparkles className="h-4 w-4" />
          {t.admin.promotions.grantButton}
        </Button>
      </div>

      <AnimatePresence>
        {showConfirm && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 p-4 backdrop-blur-sm"
            onClick={() => !isPending && setShowConfirm(false)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-labelledby="confirm-grant-title"
            >
              <div className="border-b border-surface-100 bg-gradient-to-r from-brand-50 via-violet-50/80 to-white px-6 py-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="confirm-grant-title" className="text-lg font-bold text-surface-900">
                      {t.admin.promotions.confirmGrantTitle}
                    </h3>
                    <p className="mt-1 text-sm text-surface-600">{t.admin.promotions.confirmGrantSubtitle}</p>
                  </div>
                </div>
              </div>

              {isUnlimitedGift && (
                <div className="mx-6 mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900">{t.admin.promotions.unlimitedWarning}</p>
                </div>
              )}

              <dl className="space-y-0 px-6 py-5">
                <ConfirmRow icon={User} label={t.admin.promotions.fieldUser}>
                  {selectedUser.full_name || selectedUser.email}
                </ConfirmRow>
                <ConfirmRow icon={Gift} label={t.admin.promotions.fieldGiftType}>
                  {giftTypeLabel(giftType)}
                </ConfirmRow>
                {previewExpiration && (
                  <ConfirmRow icon={Sparkles} label={t.admin.promotions.fieldExpiration}>
                    {formatDate(previewExpiration, locale)}
                  </ConfirmRow>
                )}
                <ConfirmRow icon={Bell} label={t.admin.promotions.summaryNotification} highlight>
                  {t.admin.promotions.summaryNotificationYes}
                </ConfirmRow>
              </dl>

              <div className="flex justify-end gap-2 border-t border-surface-100 bg-surface-50/50 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setShowConfirm(false)}
                >
                  {t.admin.promotions.cancel}
                </Button>
                <Button type="button" isLoading={isPending} onClick={handleGrant}>
                  {t.admin.promotions.confirmGrantButton}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ConfirmRow({
  icon: Icon,
  label,
  children,
  highlight,
}: {
  icon: typeof Gift;
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-surface-100 py-3.5 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-100">
        <Icon className="h-4 w-4 text-surface-600" />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-surface-500">{label}</dt>
        <dd className={cn("mt-0.5 text-sm font-semibold text-surface-900", highlight && "text-emerald-700")}>
          {children}
        </dd>
      </div>
    </div>
  );
}
