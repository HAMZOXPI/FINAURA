import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/layout/logo";
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-2xl font-bold text-surface-900">{dict.auth.welcomeBack}</h1>
          <p className="mt-2 text-sm text-surface-500">{dict.auth.loginSubtitle}</p>
        </div>

        {params.message === "check-email" && (
          <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {dict.auth.checkEmail}
          </div>
        )}

        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
          <AuthForm mode="login" redirectTo={params.redirect} />
        </div>
      </div>
    </div>
  );
}
