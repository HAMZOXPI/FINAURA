"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/locale-provider";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-brand-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-surface-900">{t.errors.notFoundTitle}</h2>
      <p className="mt-2 text-surface-500">{t.errors.notFoundDesc}</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
      >
        {t.errors.backHome}
      </Link>
    </div>
  );
}
