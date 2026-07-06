"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Gift, Sparkles, X } from "lucide-react";
import type { GiftCelebrationConfig } from "@/lib/gifts/celebration-config";
import { GiftConfetti } from "@/components/gifts/gift-confetti";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { useCelebrationSounds } from "@/hooks/use-celebration-sounds";

interface GiftCelebrationModalProps {
  open: boolean;
  notificationId: string | null;
  config: GiftCelebrationConfig | null;
  onClose: () => void;
}

export function GiftCelebrationModal({
  open,
  notificationId,
  config,
  onClose,
}: GiftCelebrationModalProps) {
  const { t, locale } = useTranslation();
  const copy = t.giftCelebration;
  const { playClick } = useCelebrationSounds(open, notificationId);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!config) return null;

  const ctaLabel =
    config.ctaKey === "startUsing" ? copy.ctaStartUsing : copy.ctaViewDashboard;

  const durationLabel = config.duration
    ? copy.durationValue.replace("{days}", config.duration)
    : copy.activeNow;

  const expirationLabel = config.expirationDate
    ? formatDate(config.expirationDate, locale)
    : copy.notApplicable;

  const handlePrimaryCtaClick = () => {
    if (config.ctaKey === "startUsing") {
      playClick();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-celebration-title"
        >
          {open && notificationId && <GiftConfetti key={notificationId} active />}

          <motion.button
            type="button"
            aria-label={copy.close}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative z-10 w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b ${config.cardGradient} shadow-[0_24px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]" />

              <button
                type="button"
                onClick={onClose}
                className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative px-6 pb-8 pt-10 text-center sm:px-8 sm:pb-10 sm:pt-12">
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    rotate: [0, -3, 3, 0],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className={`mx-auto flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-gradient-to-br ${config.gradient} ring-1 ring-white/20 ${config.glowClass}`}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <config.Icon className={`h-12 w-12 ${config.iconColor}`} />
                  </motion.div>
                </motion.div>

                <motion.h2
                  id="gift-celebration-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-8 text-3xl font-bold tracking-tight text-white"
                >
                  {copy.modalTitle}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 text-base text-white/70"
                >
                  {copy.modalSubtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-5 text-start backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Gift className="h-5 w-5 text-white/90" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                        {copy.benefitLabel}
                      </p>
                      <p className="truncate text-lg font-semibold text-white">{config.giftName}</p>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-3">
                    <DetailRow icon={Clock} label={copy.durationLabel} value={durationLabel} />
                    <DetailRow icon={Calendar} label={copy.expirationLabel} value={expirationLabel} />
                  </dl>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28 }}
                  className="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/45"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.grantedBy}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="mt-8 flex flex-col gap-3"
                >
                  <Link
                    href={config.ctaHref}
                    onClick={handlePrimaryCtaClick}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-base font-medium text-surface-900 shadow-lg shadow-black/20 transition-colors hover:bg-white/95"
                  >
                    {ctaLabel}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-transparent text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {copy.ctaViewDashboard}
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-sm text-white/55">
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </dt>
      <dd className="text-sm font-medium text-white">{value}</dd>
    </div>
  );
}
