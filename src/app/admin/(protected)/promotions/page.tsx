import { Suspense } from "react";
import { AdminPromotionsManager } from "@/components/admin/promotions/admin-promotions-manager";
import { AdminPromotionsSkeleton } from "@/components/admin/promotions/admin-promotions-skeleton";
import {
  getAdminGifts,
  getAdminPromotionStats,
} from "@/services/admin-promotion.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { markExpiredGifts } from "@/services/gift.service";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.promotions.title,
    description: dict.admin.promotions.subtitle,
    path: "/admin/promotions",
    noIndex: true,
    locale,
  });
}

async function PromotionsContent() {
  await markExpiredGifts();

  const [stats, activeList] = await Promise.all([
    getAdminPromotionStats(),
    getAdminGifts({ activeOnly: true, pageSize: 50 }),
  ]);

  return <AdminPromotionsManager stats={stats} activeList={activeList} />;
}

export default function AdminPromotionsPage() {
  return (
    <Suspense fallback={<AdminPromotionsSkeleton />}>
      <PromotionsContent />
    </Suspense>
  );
}
