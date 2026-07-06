import { Suspense } from "react";
import { AdminPropertiesManager } from "@/components/admin/properties/admin-properties-manager";
import { AdminPropertiesSkeleton } from "@/components/admin/properties/admin-properties-skeleton";
import {
  getAdminProperties,
  getAdminPropertyStats,
  type AdminPropertyFilterStatus,
  type AdminPropertySort,
} from "@/services/admin-property.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface AdminPropertiesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.properties.title,
    description: dict.admin.properties.subtitle,
    path: "/admin/properties",
    noIndex: true,
    locale,
  });
}

function parseStatus(value?: string): AdminPropertyFilterStatus {
  if (
    value === "active" ||
    value === "pending" ||
    value === "rejected" ||
    value === "hidden" ||
    value === "sold"
  ) {
    return value;
  }
  return "all";
}

function parseSort(value?: string): AdminPropertySort {
  if (
    value === "oldest" ||
    value === "price_asc" ||
    value === "price_desc" ||
    value === "views"
  ) {
    return value;
  }
  return "newest";
}

async function PropertiesContent({
  searchParams,
}: {
  searchParams: AdminPropertiesPageProps["searchParams"];
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [stats, list] = await Promise.all([
    getAdminPropertyStats(),
    getAdminProperties({
      search: params.q,
      status: parseStatus(params.status),
      sort: parseSort(params.sort),
      page,
    }),
  ]);

  return <AdminPropertiesManager stats={stats} list={list} />;
}

export default function AdminPropertiesPage(props: AdminPropertiesPageProps) {
  return (
    <Suspense fallback={<AdminPropertiesSkeleton />}>
      <PropertiesContent searchParams={props.searchParams} />
    </Suspense>
  );
}
