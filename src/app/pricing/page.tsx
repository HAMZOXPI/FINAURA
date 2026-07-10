import { PricingExperience } from "@/components/pricing/pricing-experience";
import { applyPlanDisplayPrices } from "@/lib/pricing/pricing-display";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/services/user.service";
import { getSubscriptionPlans, getUserSubscription } from "@/services/subscription.service";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.pricing.metaTitle,
    description: dict.pricing.metaDescription,
    path: "/pricing",
    locale,
  });
}

export default async function PricingPage() {
  const [plans, user] = await Promise.all([getSubscriptionPlans(), getCurrentUser()]);
  const subscription = user ? await getUserSubscription(user.id) : null;
  const currentPlanSlug = subscription?.plan?.slug ?? null;
  const displayPlans = applyPlanDisplayPrices(plans);

  return <PricingExperience plans={displayPlans} currentPlanSlug={currentPlanSlug} />;
}
