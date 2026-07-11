import { LoginPageContent } from "@/components/auth/login-page-content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; message?: string }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.auth.loginMetaTitle,
    description: dict.auth.loginMetaDescription,
    path: "/login",
    noIndex: true,
    locale,
  });
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const trustItems: [string, string, string] = [
    dict.admin.notifications.drawer.freeBadge,
    dict.home.zeroCommissionNoCommissionLine.replace(/\.$/, ""),
    dict.boost.checkoutSecureBadge,
  ];

  const forgotPasswordLabel =
    locale === "ar" ? "هل نسيت كلمة المرور؟" : "Mot de passe oublié ?";

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-x-hidden px-4 py-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,105,198,0.09),transparent_65%)]"
        aria-hidden
      />

      <LoginPageContent
        locale={locale}
        welcomeBadge={dict.dashboard.workspace.welcomeBadge}
        title={dict.auth.welcomeBack}
        subtitle={dict.auth.loginSubtitle}
        checkEmailMessage={params.message === "check-email" ? dict.auth.checkEmail : undefined}
        redirectTo={params.redirect}
        trustItems={trustItems}
        forgotPasswordLabel={forgotPasswordLabel}
      />
    </div>
  );
}
