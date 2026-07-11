"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Mail, MessageCircle, MessageSquare, Send, Share2 } from "lucide-react";
import type { Property } from "@/types/database";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatDetailPrice } from "@/lib/property/details-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyShareSheetProps {
  property: Property;
  propertyTitle: string;
  className?: string;
}

function ComingSoonBadge({ label }: { label: string }) {
  return (
    <span className="shrink-0 rounded-full bg-surface-100 px-2.5 py-1 text-[11px] font-semibold text-surface-500">
      {label}
    </span>
  );
}

/**
 * Premium native Bottom Sheet for sharing a property from the Property
 * Details page (mobile only). Preserves the exact same copy-link and
 * WhatsApp share logic used elsewhere, presented as richer premium rows.
 */
export function PropertyShareSheet({ property, propertyTitle, className }: PropertyShareSheetProps) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const getUrl = () => `${window.location.origin}/properties/${property.id}`;

  const copyLink = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
  };

  const shareWhatsapp = () => {
    const url = getUrl();
    const text = encodeURIComponent(`${propertyTitle} — ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const shareNative = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title: propertyTitle, url: getUrl() });
      setOpen(false);
    } catch {
      /* user cancelled or share failed */
    }
  };

  const priceLabel = formatDetailPrice(property.price, property.status, locale);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.properties.share}
        title={t.properties.share}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-500 transition-all duration-[250ms] hover:border-brand-200 hover:text-brand-600",
          className
        )}
      >
        <Share2 className="h-[18px] w-[18px]" />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        height="auto"
        closeLabel={t.notifications.close}
        ariaLabel={t.properties.shareSheetTitle}
        zIndex={220}
        className="rounded-t-[30px] sm:rounded-t-[30px]"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pb-2">
          <AnimatePresence initial={false}>
            {copied && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  <Check className="h-4 w-4 shrink-0" />
                  {t.properties.shareLinkCopiedToast}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center gap-2 pb-4 pt-1 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <Share2 className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-base font-bold text-surface-900">{t.properties.shareSheetTitle}</h2>
            <p className="text-sm text-surface-500">{t.properties.shareSheetSubtitle}</p>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-surface-200/80 bg-surface-50 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image
                src={property.images[0] || PLACEHOLDER_IMAGE}
                alt={propertyTitle}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-surface-900">{propertyTitle}</p>
              <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-surface-500">
                <span
                  className="shrink-0 font-semibold text-brand-700"
                  dir={locale === "ar" ? "ltr" : undefined}
                >
                  <span className="[unicode-bidi:isolate]">{priceLabel}</span>
                </span>
                <span aria-hidden>·</span>
                <span className="truncate">{property.city}</span>
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <BottomSheetOption
              icon={copied ? <Check className="h-[18px] w-[18px]" /> : <Link2 className="h-[18px] w-[18px]" />}
              label={copied ? t.properties.shareLinkCopied : t.properties.shareCopyLink}
              onClick={copyLink}
            />
            <BottomSheetOption
              icon={<MessageCircle className="h-[18px] w-[18px]" />}
              label={t.properties.shareWhatsapp}
              onClick={shareWhatsapp}
            />
            <BottomSheetOption
              icon={<MessageSquare className="h-[18px] w-[18px]" />}
              label={t.properties.shareMessenger}
              disabled
              trailing={<ComingSoonBadge label={t.properties.shareComingSoonBadge} />}
            />
            <BottomSheetOption
              icon={<Send className="h-[18px] w-[18px]" />}
              label={t.properties.shareTelegram}
              disabled
              trailing={<ComingSoonBadge label={t.properties.shareComingSoonBadge} />}
            />
            <BottomSheetOption
              icon={<Mail className="h-[18px] w-[18px]" />}
              label={t.properties.shareEmail}
              disabled
              trailing={<ComingSoonBadge label={t.properties.shareComingSoonBadge} />}
            />
            {canNativeShare && (
              <BottomSheetOption
                icon={<Share2 className="h-[18px] w-[18px]" />}
                label={t.properties.shareMore}
                onClick={shareNative}
              />
            )}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
