"use client";

import { useState, useTransition } from "react";
import { Check, Flag, Heart, Link2, MoreHorizontal, Share2, User } from "lucide-react";
import { toggleFavorite } from "@/actions/property.actions";
import { BottomSheet, BottomSheetOption } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyActionsSheetProps {
  propertyId: string;
  propertyTitle: string;
  favorited?: boolean;
  /** Property owner id, used to render the "View profile" row. Omitted when unavailable. */
  sellerId?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

/**
 * Mobile-only "more actions" entry point for a property (Property Card and
 * Property Details). Consolidates favorite / share / copy link / view seller
 * profile / report into a single premium Bottom Sheet, reusing the exact
 * same underlying actions as the existing standalone buttons.
 */
export function PropertyActionsSheet({
  propertyId,
  propertyTitle,
  favorited: initialFavorited = false,
  sellerId,
  triggerClassName,
  triggerLabel,
}: PropertyActionsSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getUrl = () => `${window.location.origin}/properties/${propertyId}`;

  const handleToggleFavorite = () => {
    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if (!result?.error) {
        setFavorited((prev) => !prev);
      }
    });
  };

  const handleShare = async () => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: propertyTitle, url });
      } catch {
        /* user cancelled or share failed */
      }
      setOpen(false);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
    setOpen(false);
  };

  const handleCopyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={triggerLabel ?? t.propertyDetail.moreActions}
        title={triggerLabel ?? t.propertyDetail.moreActions}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-500 transition-all duration-[250ms] hover:border-brand-200 hover:text-brand-600",
          triggerClassName
        )}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t.propertyDetail.actionBarLabel}
        height="auto"
        closeLabel={t.notifications.close}
        zIndex={220}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="space-y-1 pb-2">
          <BottomSheetOption
            icon={
              <Heart
                className={cn("h-[18px] w-[18px]", favorited && "fill-current text-red-500")}
              />
            }
            label={favorited ? t.favorites.removeFromFavorites : t.favorites.addToFavorites}
            onClick={handleToggleFavorite}
            disabled={isPending}
          />
          <BottomSheetOption
            icon={<Share2 className="h-[18px] w-[18px]" />}
            label={t.properties.share}
            onClick={handleShare}
          />
          <BottomSheetOption
            icon={copied ? <Check className="h-[18px] w-[18px]" /> : <Link2 className="h-[18px] w-[18px]" />}
            label={copied ? t.properties.shareLinkCopied : t.properties.shareCopyLink}
            onClick={handleCopyLink}
          />
          {sellerId && (
            <BottomSheetOption
              icon={<User className="h-[18px] w-[18px]" />}
              label={t.seller.viewProfile}
              href={`/seller/${sellerId}`}
              onClick={() => setOpen(false)}
            />
          )}
          <BottomSheetOption
            icon={<Flag className="h-[18px] w-[18px]" />}
            label={t.propertyDetail.reportComingSoon}
            disabled
          />
        </div>
      </BottomSheet>
    </>
  );
}
