"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleSellerFavorite } from "@/actions/review.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerFavoriteButtonProps {
  sellerId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function SellerFavoriteButton({
  sellerId,
  initialFavorited = false,
  className,
}: SellerFavoriteButtonProps) {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleSellerFavorite(sellerId);
      if (result?.success) {
        setFavorited(Boolean(result.favorited));
      }
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "h-11 rounded-xl border-surface-200 text-sm font-semibold transition-colors",
        favorited && "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
      {favorited ? t.seller.favorited : t.seller.favoriteSeller}
    </Button>
  );
}
