import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";
import { formatPlanPrice, interpolate } from "@/lib/utils";
import { getSubscriptionPlans } from "@/services/subscription.service";

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
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const plans = await getSubscriptionPlans();

  return (
    <div className="container-app py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-surface-900">{dict.pricing.title}</h1>
        <p className="mt-4 text-lg text-surface-500">{dict.pricing.subtitle}</p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
        {plans.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <p className="text-lg font-medium text-surface-900">{dict.pricing.dbSetupTitle}</p>
            <p className="mt-2 text-sm text-surface-600">{dict.pricing.dbSetupDesc}</p>
          </div>
        ) : (
          plans.map((plan) => {
            const highlighted = plan.slug === "pro";
            const priceLabel = formatPlanPrice(plan.price_monthly, locale);
            const period =
              plan.price_monthly === 0 ? dict.pricing.forever : dict.pricing.perMonth;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 ${
                  highlighted
                    ? "border-brand-500 bg-brand-50 shadow-lg ring-1 ring-brand-500"
                    : "border-surface-200 bg-white shadow-sm"
                }`}
              >
                {highlighted && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                    {dict.pricing.mostPopular}
                  </span>
                )}
                <h3 className="text-xl font-semibold text-surface-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-surface-900">{priceLabel}</span>
                  <span className="text-surface-500">{period}</span>
                </div>
                {plan.max_listings !== null && plan.max_listings > 0 && (
                  <p className="mt-2 text-sm text-surface-500">
                    {interpolate(dict.pricing.upToListings, { count: plan.max_listings })}
                  </p>
                )}
                {plan.max_listings === null && plan.slug !== "free" && (
                  <p className="mt-2 text-sm text-surface-500">{dict.pricing.unlimitedListings}</p>
                )}

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      <span className="text-surface-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  href="/register"
                  className="w-full"
                  variant={highlighted ? "primary" : "outline"}
                >
                  {plan.slug === "free"
                    ? dict.pricing.getStarted
                    : plan.slug === "enterprise"
                      ? dict.pricing.contactSales
                      : dict.pricing.startPro}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
