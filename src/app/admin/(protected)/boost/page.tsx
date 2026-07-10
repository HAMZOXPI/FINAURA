import { Suspense } from "react";
import { AdminBoostManager } from "@/components/admin/boost/admin-boost-manager";
import { getAdminBoostPageData } from "@/services/admin-boost.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.boost.title,
    description: dict.admin.boost.subtitle,
    path: "/admin/boost",
    noIndex: true,
    locale,
  });
}

async function BoostPageContent() {
  const data = await getAdminBoostPageData();
  return <AdminBoostManager data={data} />;
}

export default function AdminBoostPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-100" />}>
      <BoostPageContent />
    </Suspense>
  );
}
