"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ImageIcon,
  MoreHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ChatMessage, ConversationWithMeta, PropertyStatus } from "@/types/database";
import { PropertyPreviewRow } from "@/components/messaging/property-preview-row";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import {
  extractSharedMedia,
  formatMemberSince,
  getSafeImageSrc,
  getSafePropertyImage,
  resolveOtherParticipant,
} from "@/lib/messaging/messaging-display";
import { cn, formatPrice, getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

interface SellerPanelData {
  verifiedSeller: boolean;
  createdAt: string | null;
  responseRate: number | null;
  avgResponseTimeHours: number | null;
  listingsCount: number;
  recentListings: Array<{
    id: string;
    title: string;
    price: number;
    status: PropertyStatus;
    images: string[];
    city: string;
  }>;
}

interface MessagingInfoPanelProps {
  conversation: ConversationWithMeta;
  messages: ChatMessage[];
  isOnline: boolean;
  className?: string;
}


export function MessagingInfoPanel({
  conversation,
  messages,
  isOnline,
  className,
}: MessagingInfoPanelProps) {
  const { t, locale } = useTranslation();
  const other = resolveOtherParticipant(conversation);
  const sellerId = conversation.seller_id ?? "";
  const isSeller = Boolean(other.id && sellerId && other.id === sellerId);
  const [panelData, setPanelData] = useState<SellerPanelData | null>(null);

  const sharedMedia = useMemo(() => extractSharedMedia(messages ?? []), [messages]);

  useEffect(() => {
    let cancelled = false;

    async function loadPanelData() {
      if (!other.id) return;

      const supabase = createClient();
      const profileQuery = supabase
        .from("profiles")
        .select("verified_seller, created_at, response_rate, avg_response_time_hours")
        .eq("id", other.id)
        .maybeSingle();

      const listingsQuery = isSeller
        ? supabase
            .from("properties")
            .select("id, title, price, status, images, city")
            .eq("owner_id", sellerId)
            .eq("listing_status", "published")
            .order("created_at", { ascending: false })
            .limit(3)
        : Promise.resolve({ data: [], error: null });

      const [{ data: profile }, listingsResult] = await Promise.all([
        profileQuery,
        listingsQuery,
      ]);

      const { count } = isSeller
        ? await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("owner_id", sellerId)
            .eq("listing_status", "published")
        : { count: 0 };

      if (cancelled) return;

      setPanelData({
        verifiedSeller: Boolean(profile?.verified_seller),
        createdAt: profile?.created_at ?? null,
        responseRate: profile?.response_rate ?? null,
        avgResponseTimeHours: profile?.avg_response_time_hours ?? null,
        listingsCount: count ?? 0,
        recentListings: Array.isArray(listingsResult.data)
          ? (listingsResult.data as SellerPanelData["recentListings"])
          : [],
      });
    }

    void loadPanelData();
    return () => {
      cancelled = true;
    };
  }, [other.id, sellerId, isSeller]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "hidden min-h-0 flex-col overflow-hidden rounded-[24px] border border-white/60",
        "bg-white/85 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.12)] backdrop-blur-xl xl:flex",
        className
      )}
    >
      <div className="border-b border-surface-200/80 px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-surface-500">
          {t.messaging.infoPanelTitle}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-[20px] border border-surface-200/80 bg-gradient-to-b from-brand-50/50 to-white p-4 text-center shadow-sm">
          <div className="relative mx-auto h-20 w-20">
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white shadow-md">
              {other?.avatar_url ? (
                <Image src={getSafeImageSrc(other.avatar_url, PLACEHOLDER_IMAGE)} alt="" fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-brand-100 text-lg font-bold text-brand-700">
                  {getInitials(other.full_name ?? t.properties.defaultAgent)}
                </span>
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-1 end-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <h3 className="text-base font-bold text-surface-900">
              {other.full_name ?? t.properties.defaultAgent}
            </h3>
            {panelData?.verifiedSeller && (
              <BadgeCheck className="h-4 w-4 text-brand-600" aria-label={t.seller.verifiedSeller} />
            )}
          </div>
          <p className="mt-1 text-xs text-surface-500">
            {isOnline ? t.messaging.online : t.messaging.lastSeenComingSoon}
          </p>
          {panelData?.createdAt && (
            <p className="mt-2 text-xs text-surface-500">
              {t.messaging.memberSince} {formatMemberSince(panelData.createdAt, locale)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-surface-200/80 bg-surface-50/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.messaging.responseRate}
            </p>
            <p className="mt-1 text-lg font-bold text-surface-900">
              {panelData?.responseRate != null ? `${Math.round(panelData.responseRate)}%` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200/80 bg-surface-50/80 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-surface-500">
              {t.messaging.responseTime}
            </p>
            <p className="mt-1 text-lg font-bold text-surface-900">
              {panelData?.avgResponseTimeHours != null
                ? `${panelData.avgResponseTimeHours}h`
                : "—"}
            </p>
          </div>
        </div>

        {isSeller && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-surface-900">{t.messaging.recentListings}</p>
                <span className="text-xs font-semibold text-surface-500">
                  {panelData?.listingsCount ?? 0} {t.messaging.listings}
                </span>
              </div>
              <div className="space-y-2">
                {(panelData?.recentListings ?? []).map((listing) => {
                  if (!listing?.id) return null;
                  const listingImage = getSafePropertyImage(listing?.images, PLACEHOLDER_IMAGE);
                  return (
                  <Link
                    key={listing.id}
                    href={`/properties/${listing.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-surface-200/80 bg-white p-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={listingImage}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-surface-900">
                        {listing?.title ?? ""}
                      </p>
                      <p className="text-xs font-bold text-brand-700">
                        {formatPrice(listing?.price ?? 0, listing?.status, locale)}
                      </p>
                    </div>
                  </Link>
                  );
                })}
                {(panelData?.recentListings?.length ?? 0) === 0 && (
                  <p className="rounded-2xl border border-dashed border-surface-200 px-3 py-4 text-center text-xs text-surface-500">
                    {t.messaging.noRecentListings}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-bold text-brand-800">{t.messaging.premiumPlan}</p>
              </div>
              <p className="mt-1 text-xs text-brand-700/80">{t.messaging.premiumPlanHint}</p>
            </div>
          </>
        )}

        <div>
          <div className="mb-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-surface-500" />
            <p className="text-sm font-bold text-surface-900">{t.messaging.sharedMedia}</p>
          </div>
          {sharedMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {sharedMedia.map((url, index) => {
                const safeUrl = getSafeImageSrc(url, PLACEHOLDER_IMAGE);
                return (
                <a
                  key={`${safeUrl}-${index}`}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square overflow-hidden rounded-xl shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Image src={safeUrl} alt="" fill className="object-cover" />
                </a>
                );
              })}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-surface-200 px-3 py-4 text-center text-xs text-surface-500">
              {t.messaging.noSharedMedia}
            </p>
          )}
        </div>

        <div>
          <p className="mb-2.5 text-sm font-bold text-surface-900">{t.messaging.quickActions}</p>
          <Link
            href={isSeller && other.id ? `/seller/${other.id}` : sellerId ? `/seller/${sellerId}` : "#"}
            className="flex items-center gap-2.5 rounded-xl border border-surface-200 bg-white px-3.5 py-3 text-sm font-semibold text-surface-800 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            <UserRound className="h-4 w-4 shrink-0 text-brand-600" />
            {t.messaging.viewProfile}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}

export function ChatConversationHeader({
  conversation,
  isOnline,
  typingUserId,
  onBack,
  showBackButton,
}: {
  conversation: ConversationWithMeta;
  isOnline: boolean;
  typingUserId: string | null;
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  const { t } = useTranslation();
  const other = resolveOtherParticipant(conversation);
  const avatarSrc = getSafeImageSrc(other?.avatar_url, "");

  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-white/60 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-3 py-3.5 sm:px-4 lg:px-5">
        {showBackButton && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-surface-500 transition-colors hover:bg-surface-100 md:hidden"
            aria-label={t.messaging.backToList}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative shrink-0">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-white shadow-sm sm:h-12 sm:w-12">
            {avatarSrc ? (
              <Image src={avatarSrc} alt="" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand-50 text-xs font-bold text-brand-700">
                {getInitials(other.full_name ?? t.properties.defaultAgent)}
              </span>
            )}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 end-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-surface-900 sm:text-base">
            {other.full_name ?? t.properties.defaultAgent}
          </p>
          <p className="text-xs text-surface-500">
            {typingUserId
              ? t.messaging.typing
              : isOnline
                ? t.messaging.online
                : t.messaging.lastSeenComingSoon}
          </p>
        </div>

        <button
          type="button"
          className="shrink-0 rounded-xl p-2.5 text-surface-500 transition-colors hover:bg-surface-100"
          aria-label={t.messaging.moreActions}
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <PropertyPreviewRow conversation={conversation} />
    </div>
  );
}
