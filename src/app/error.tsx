"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-surface-900">{t.errors.genericTitle}</h2>
      <p className="mt-2 max-w-md text-surface-500">{t.errors.genericDesc}</p>
      <Button onClick={reset} className="mt-6">
        {t.errors.tryAgain}
      </Button>
    </div>
  );
}
