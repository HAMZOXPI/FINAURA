import { RegisterPageContent } from "@/components/auth/register-page-content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.auth.registerMetaTitle,
    description: dict.auth.registerMetaDescription,
    path: "/register",
    noIndex: true,
    locale,
  });
}

export default async function RegisterPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const trustItems: [string, string, string] = [
    dict.pricing.bottomCta.startFree,
    `0% ${dict.home.zeroCommissionBadgeValue}`,
    dict.boost.checkoutSecureBadge,
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-x-hidden px-4 py-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,105,198,0.09),transparent_65%)]"
        aria-hidden
      />

      <RegisterPageContent
        locale={locale}
        welcomeBadge={dict.dashboard.workspace.welcomeBadge}
        title={dict.auth.createAccount}
        subtitle={dict.auth.registerSubtitle}
        trustItems={trustItems}
      />
    </div>
  );
}
