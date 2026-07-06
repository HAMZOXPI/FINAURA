import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";
import { SellerProfileSettingsForm } from "@/components/dashboard/seller-profile-settings-form";
import { SellerVerificationSection } from "@/components/dashboard/seller-verification-section";
import { requireUser } from "@/lib/supabase/auth";
import { getProfile } from "@/services/user.service";
import { getUserSubscription } from "@/services/subscription.service";
import {
  getLatestVerificationRequest,
  resolveSellerVerificationStatus,
} from "@/services/verification.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import type { VerificationRequest } from "@/types/database";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.settingsTitle,
    description: dict.dashboard.settingsSubtitle,
    path: "/dashboard/settings",
    noIndex: true,
    locale,
  });
}

export default async function DashboardSettingsPage() {
  const dict = getDictionary(await getLocale());
  const user = await requireUser();

  const [profile, subscription, latestRequestRaw] = await Promise.all([
    user ? getProfile(user.id) : Promise.resolve(null),
    user ? getUserSubscription(user.id) : Promise.resolve(null),
    user ? getLatestVerificationRequest(user.id) : Promise.resolve(null),
  ]);

  const latestRequest = latestRequestRaw as VerificationRequest | null;
  const verificationStatus = resolveSellerVerificationStatus(
    {
      is_verified: profile?.is_verified,
      verified_seller: profile?.verified_seller,
    },
    latestRequest
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900">{dict.dashboard.settingsTitle}</h1>
      <p className="mt-1 text-sm text-surface-500">{dict.dashboard.settingsSubtitle}</p>

      <div className="mt-8 max-w-lg space-y-8">
        <ProfileSettingsForm
          profile={profile}
          email={user?.email ?? ""}
          subscription={subscription}
        />
        <SellerProfileSettingsForm profile={profile} />
        <SellerVerificationSection
          profile={profile}
          latestRequest={latestRequest}
          status={verificationStatus}
        />
      </div>
    </div>
  );
}
