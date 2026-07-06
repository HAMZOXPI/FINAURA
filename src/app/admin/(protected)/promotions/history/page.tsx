import { Suspense } from "react";
import { AdminPromotionsHistoryManager } from "@/components/admin/promotions/admin-promotions-history-manager";
import { AdminPromotionsSkeleton } from "@/components/admin/promotions/admin-promotions-skeleton";
import {
  getAdminGifts,
  type AdminGiftFilters,
} from "@/services/admin-promotion.service";
import type { AdminGiftType } from "@/types/database";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { markExpiredGifts } from "@/services/gift.service";

interface AdminPromotionsHistoryPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.promotions.historyPageTitle,
    description: dict.admin.promotions.historyPageSubtitle,
    path: "/admin/promotions/history",
    noIndex: true,
    locale,
  });
}

function parseStatus(value?: string): AdminGiftFilters["status"] {
  if (value === "active" || value === "expired" || value === "revoked") return value;
  return "all";
}

function parseType(value?: string): AdminGiftFilters["giftType"] {
  const types: AdminGiftType[] = [
    "unlimited_listings",
    "extra_listing_credits",
    "premium_subscription",
    "premium_extension",
    "featured_listing_credits",
    "boost_credits",
    "custom_gift",
    "discount_coupon",
  ];
  if (types.includes(value as AdminGiftType)) return value as AdminGiftType;
  return "all";
}

async function HistoryContent({
  searchParams,
}: {
  searchParams: AdminPromotionsHistoryPageProps["searchParams"];
}) {
  await markExpiredGifts();

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const list = await getAdminGifts({
    search: params.q,
    status: parseStatus(params.status),
    giftType: parseType(params.type),
    dateFrom: params.from,
    dateTo: params.to,
    page,
    pageSize: 20,
  });

  return <AdminPromotionsHistoryManager list={list} />;
}

export default function AdminPromotionsHistoryPage(props: AdminPromotionsHistoryPageProps) {
  return (
    <Suspense fallback={<AdminPromotionsSkeleton />}>
      <HistoryContent searchParams={props.searchParams} />
    </Suspense>
  );
}
