"use client";

import { Flag, Heart, Printer } from "lucide-react";
import { FavoriteButton } from "@/components/properties/favorite-button";
import { PropertyCardShareButton } from "@/components/properties/property-card-share-button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyActionBarProps {
  propertyId: string;
  propertyTitle: string;
  favorited: boolean;
  className?: string;
}

function GlassActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  children,
}: {
  icon?: typeof Heart;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full",
        "border border-white/60 bg-white/70 px-4 text-sm font-semibold text-surface-700",
        "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.12)] backdrop-blur-md",
        "transition-all duration-[250ms]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {children ?? (Icon && <Icon className="h-[18px] w-[18px]" aria-hidden />)}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function PropertyActionBar({
  propertyId,
  propertyTitle,
  favorited,
  className,
}: PropertyActionBarProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2.5", className)}
      role="toolbar"
      aria-label={t.propertyDetail.actionBarLabel}
    >
      <FavoriteButton
        propertyId={propertyId}
        initialFavorited={favorited}
        variant="compact"
        className={cn(
          "h-11 min-w-11 rounded-full border border-white/60 bg-white/70 px-4",
          "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.12)] backdrop-blur-md",
          "transition-all duration-[250ms] [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5"
        )}
      />

      <PropertyCardShareButton
        propertyId={propertyId}
        title={propertyTitle}
        className={cn(
          "h-11 min-w-11 rounded-full border border-white/60 bg-white/70 px-4",
          "shadow-[0_4px_20px_-6px_rgba(0,0,0,0.12)] backdrop-blur-md",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-0.5"
        )}
      />

      <GlassActionButton
        icon={Printer}
        label={t.propertyDetail.printComingSoon}
        disabled
      />

      <GlassActionButton
        icon={Flag}
        label={t.propertyDetail.reportComingSoon}
        disabled
      />
    </div>
  );
}
