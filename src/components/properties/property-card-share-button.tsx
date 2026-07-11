"use client";

import { useEffect, useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { useIsMobileViewport } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyCardShareButtonProps {
  propertyId: string;
  title: string;
  className?: string;
}

export function PropertyCardShareButton({
  propertyId,
  title,
  className,
}: PropertyCardShareButtonProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobileViewport();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  const getUrl = () => `${window.location.origin}/properties/${propertyId}`;

  const shareNative = async (url: string) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return true;
      } catch {
        /* user cancelled or share failed */
      }
    }
    return false;
  };

  const copyLink = async () => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    }
  };

  const shareWhatsapp = () => {
    const url = getUrl();
    const text = encodeURIComponent(`${title} — ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isMobile) {
      const url = getUrl();
      const shared = await shareNative(url);
      if (!shared && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-500 transition-all duration-[250ms] hover:border-brand-200 hover:text-brand-600",
          className
        )}
        aria-label={t.properties.share}
      >
        <Share2 className="h-[18px] w-[18px]" />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.properties.share}
        height="small"
        closeLabel={t.notifications.close}
        zIndex={220}
      >
        <div className="space-y-1 pb-2">
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
          {canNativeShare && (
            <BottomSheetOption
              icon={<Share2 className="h-[18px] w-[18px]" />}
              label={t.properties.shareMore}
              onClick={async () => {
                const shared = await shareNative(getUrl());
                if (shared) setOpen(false);
              }}
            />
          )}
        </div>
      </BottomSheet>
    </>
  );
}
