"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/property.actions";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface FavoriteButtonProps {
  propertyId: string;
  initialFavorited?: boolean;
  variant?: "default" | "overlay" | "compact";
  className?: string;
}

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  variant = "default",
  className,
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if (!result?.error) {
        setFavorited((prev) => !prev);
      }
    });
  };

  const variantClass =
    variant === "overlay"
      ? cn(
          "h-10 w-10 rounded-full border-0 bg-white/95 text-surface-700 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-[250ms] hover:scale-105 hover:bg-white",
          favorited && "text-red-500"
        )
      : variant === "compact"
        ? cn(
            "h-10 w-10 rounded-xl border border-surface-200 bg-white text-surface-500 transition-all duration-[250ms] hover:border-brand-200 hover:text-brand-600",
            favorited && "border-red-200 bg-red-50 text-red-500"
          )
        : cn(
            "h-11 w-11 rounded-xl border transition-colors duration-[250ms]",
            favorited
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-surface-300 bg-white text-surface-500 hover:border-red-200 hover:text-red-500"
          );

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex shrink-0 items-center justify-center disabled:opacity-60",
        variantClass,
        className
      )}
      aria-label={favorited ? t.favorites.saved : t.favorites.save}
    >
      <Heart className={cn("h-[18px] w-[18px]", favorited && "fill-current")} />
    </button>
  );
}
