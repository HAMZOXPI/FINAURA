import { Suspense } from "react";
import { DashboardListings } from "@/components/dashboard/dashboard-listings";
import { Button } from "@/components/ui/button";
import { resolveUserId } from "@/lib/supabase/auth";
import { getUserProperties } from "@/services/property.service";
import { canCreateListing } from "@/services/subscription.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.myPropertiesTitle,
    description: dict.dashboard.myPropertiesSubtitle,
    path: "/dashboard/properties",
    noIndex: true,
    locale,
  });
}

export default async function DashboardPropertiesPage() {
  const dict = getDictionary(await getLocale());
  const userId = await resolveUserId();
  const [properties, listingLimit] = await Promise.all([
    getUserProperties(userId),
    canCreateListing(userId),
  ]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {dict.dashboard.myPropertiesTitle}
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            {dict.dashboard.myPropertiesSubtitle}
          </p>
        </div>
        {listingLimit.allowed ? (
          <Button href="/dashboard/new">{dict.dashboard.newListing}</Button>
        ) : (
          <Button href="/pricing">{dict.dashboard.upgradePlan}</Button>
        )}
      </div>

      {!listingLimit.allowed && listingLimit.message && (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {listingLimit.message}
        </div>
      )}

      <div className="mt-8">
        <Suspense fallback={<div className="text-sm text-surface-500">{dict.boost.loading}</div>}>
          <DashboardListings properties={properties} />
        </Suspense>
      </div>
    </div>
  );
}
