"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ConversationWithMeta } from "@/types/database";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function PropertyPreviewBar({ conversation }: { conversation: ConversationWithMeta }) {
  const { t, locale } = useTranslation();
  const property = conversation.property;
  if (!property) return null;

  const image = property.images?.[0] ?? PLACEHOLDER_IMAGE;

  return (
    <div className="border-b border-surface-200 bg-white px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
          <Image src={image} alt={property.title} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-surface-900">{property.title}</p>
          <p className="text-sm font-bold text-brand-700">
            {formatPrice(property.price, property.status, locale)}
          </p>
          <p className="truncate text-xs text-surface-500">{property.city}</p>
        </div>
        <Link
          href={`/properties/${property.id}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
        >
          {t.messaging.openListing}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
