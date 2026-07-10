"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import type { ConversationWithMeta } from "@/types/database";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyPreviewRowProps {
  conversation: ConversationWithMeta;
  className?: string;
}

export function PropertyPreviewRow({ conversation, className }: PropertyPreviewRowProps) {
  const { t } = useTranslation();
  const property = conversation?.property;
  if (!property?.id) return null;

  const title = property?.title ?? "";
  const city = property?.city ?? "";

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        "flex h-[52px] min-h-[52px] items-center gap-3 border-t border-surface-100/90 bg-surface-50/60 px-3 transition-colors hover:bg-brand-50/50 sm:px-4 lg:px-5",
        className
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm ring-1 ring-surface-200/80">
        <Home className="h-4 w-4 text-brand-600" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold leading-tight text-surface-900">
          {title}
        </p>
        {city && (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-surface-500">
            {city}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs font-semibold text-brand-700">
        {t.messaging.openListing} →
      </span>
    </Link>
  );
}
