"use client";

import { useState, useTransition } from "react";
import {
  Copy,
  Flag,
  Heart,
  Link2,
  MessageCircle,
  Share2,
  Check,
} from "lucide-react";
import { toggleSellerFavorite } from "@/actions/review.actions";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileActionsProps {
  sellerId: string;
  initialFavorited: boolean;
  onContact: () => void;
}

function GlassButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  icon?: typeof Heart;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4",
        "border border-white/60 bg-white/70 text-sm font-semibold text-surface-700",
        "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.1)] backdrop-blur-md",
        "transition-all duration-[250ms]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2",
        active && "border-red-200/80 bg-red-50/90 text-red-600",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children ?? (Icon && <Icon className={cn("h-4 w-4", active && "fill-current")} aria-hidden />)}
      <span>{label}</span>
    </button>
  );
}

export function SellerProfileActions({
  sellerId,
  initialFavorited,
  onContact,
}: SellerProfileActionsProps) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const profileUrl =
    typeof window !== "undefined" ? `${window.location.origin}/seller/${sellerId}` : "";

  const handleFavorite = () => {
    startTransition(async () => {
      const result = await toggleSellerFavorite(sellerId);
      if (result?.success) setFavorited(Boolean(result.favorited));
    });
  };

  const handleShare = async () => {
    const url = profileUrl || `${window.location.origin}/seller/${sellerId}`;
    const title = document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    const url = profileUrl || `${window.location.origin}/seller/${sellerId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="flex flex-wrap gap-2.5"
      role="toolbar"
      aria-label={t.seller.profileActionsLabel}
    >
      <GlassButton
        icon={Heart}
        label={favorited ? t.seller.favorited : t.seller.favoriteSeller}
        onClick={handleFavorite}
        active={favorited}
        disabled={isPending}
      />

      <GlassButton
        icon={MessageCircle}
        label={t.seller.contactSeller}
        onClick={onContact}
      />

      <GlassButton icon={Share2} label={t.seller.shareProfile} onClick={handleShare} />

      <GlassButton
        icon={copied ? Check : Copy}
        label={copied ? t.seller.linkCopied : t.seller.copyProfileLink}
        onClick={handleCopy}
      />

      <GlassButton
        icon={Flag}
        label={t.seller.reportComingSoon}
        disabled
      />

      <span className="sr-only">
        <Link2 aria-hidden />
      </span>
    </div>
  );
}
