import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.accessDeniedTitle,
    noIndex: true,
    locale,
  });
}

export default async function AdminAccessDeniedPage() {
  const dict = getDictionary(await getLocale());

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-surface-900">
          {dict.admin.accessDeniedTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-surface-500">
          {dict.admin.accessDeniedMessage}
        </p>
        <Button href="/" className="mt-6 w-full">
          {dict.admin.backToHome}
        </Button>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {dict.admin.goToDashboard}
        </Link>
      </div>
    </div>
  );
}
