"use client";

import { FileDown, FileText, Printer } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

function ExportButton({
  icon: Icon,
  label,
}: {
  icon: typeof FileDown;
  label: string;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      disabled
      title={t.admin.verifications.comingSoon}
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-surface-200 bg-white px-3 py-2 text-xs font-semibold text-surface-400 opacity-70 shadow-sm"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      <span className="hidden sm:inline">{label}</span>
      <span className="rounded-full bg-surface-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-surface-400">
        {t.admin.verifications.export.soon}
      </span>
    </button>
  );
}

export function VerificationExportBar() {
  const { t } = useTranslation();

  return (
    <div
      role="toolbar"
      aria-label={t.admin.verifications.export.title}
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <ExportButton icon={FileDown} label={t.admin.verifications.export.csv} />
      <ExportButton icon={FileText} label={t.admin.verifications.export.pdf} />
      <ExportButton icon={Printer} label={t.admin.verifications.export.print} />
    </div>
  );
}
