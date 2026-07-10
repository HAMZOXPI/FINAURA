import { Suspense } from "react";
import { AdminVerificationsManager } from "@/components/admin/verifications/admin-verifications-manager";
import { AdminVerificationsSkeleton } from "@/components/admin/verifications/admin-verifications-skeleton";
import {
  getAdminVerificationRequests,
  getAdminVerificationStats,
} from "@/services/admin-verification.service";
import { getAdminRecentActivity } from "@/services/admin.service";
import type { VerificationRequestStatus } from "@/types/database";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface AdminVerificationsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    date?: string;
    page?: string;
  }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.verifications.title,
    description: dict.admin.verifications.subtitle,
    path: "/admin/verifications",
    noIndex: true,
    locale,
  });
}

function parseStatus(value?: string): VerificationRequestStatus | "all" {
  if (value === "pending" || value === "approved" || value === "rejected") return value;
  return "all";
}

function parseDateFilter(value?: string): { dateFrom?: string; dateTo?: string } {
  if (!value) return {};

  if (value === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
  }

  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return {};
  start.setHours(0, 0, 0, 0);
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
}

async function VerificationsContent({
  searchParams,
}: {
  searchParams: AdminVerificationsPageProps["searchParams"];
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = parseStatus(params.status);
  const dateRange = parseDateFilter(params.date);

  const [stats, list, activity] = await Promise.all([
    getAdminVerificationStats(),
    getAdminVerificationRequests({
      search: params.q,
      status,
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      page,
    }),
    getAdminRecentActivity(50),
  ]);

  return <AdminVerificationsManager stats={stats} list={list} activity={activity} />;
}

export default function AdminVerificationsPage(props: AdminVerificationsPageProps) {
  return (
    <Suspense fallback={<AdminVerificationsSkeleton />}>
      <VerificationsContent searchParams={props.searchParams} />
    </Suspense>
  );
}
