"use client";

import { Share2 } from "lucide-react";
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

  const handleShare = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const url = `${window.location.origin}/properties/${propertyId}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled or share failed */
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-white text-surface-500 transition-all duration-[250ms] hover:border-brand-200 hover:text-brand-600",
        className
      )}
      aria-label={t.properties.share}
    >
      <Share2 className="h-[18px] w-[18px]" />
    </button>
  );
}
