import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/dashboard/property-form";
import { requireUser } from "@/lib/supabase/auth";
import { canCreateListing } from "@/services/subscription.service";
import { createMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.createNewTitle,
    description: dict.dashboard.createNewSubtitle,
    path: "/dashboard/new",
    noIndex: true,
    locale,
  });
}

export default async function NewListingPage() {
  const dict = getDictionary(await getLocale());
  const user = await requireUser();

  const listingLimit = user
    ? await canCreateListing(user.id)
    : { allowed: true, current: 0, max: null, message: undefined };

  return (
    <div>
      <Link
        href="/dashboard/properties"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-surface-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        {dict.dashboard.backToProperties}
      </Link>

      <h1 className="text-2xl font-bold text-surface-900">{dict.dashboard.createNewTitle}</h1>
      <p className="mt-1 text-sm text-surface-500">{dict.dashboard.createNewSubtitle}</p>

      {!listingLimit.allowed ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="text-amber-800">{listingLimit.message ?? dict.dashboard.limitUpgrade}</p>
          <Button href="/pricing" className="mt-4">
            {dict.dashboard.upgradePlan}
          </Button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
          <PropertyForm mode="create" />
        </div>
      )}
    </div>
  );
}
