"use client";

import type { AdminVerificationRequestRow } from "@/services/admin-verification.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/i18n/locale-provider";

interface AdminVerificationsRejectModalProps {
  request: AdminVerificationRequestRow;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function AdminVerificationsRejectModal({
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  isPending,
}: AdminVerificationsRejectModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-surface-900">{t.admin.verifications.rejectTitle}</h3>
        <p className="mt-2 text-sm text-surface-500">{t.admin.verifications.rejectSubtitle}</p>
        <Textarea
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder={t.admin.verifications.rejectPlaceholder}
          rows={4}
          className="mt-4"
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {t.admin.verifications.cancel}
          </Button>
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
            disabled={isPending || reason.trim().length < 5}
            isLoading={isPending}
          >
            {t.admin.verifications.confirmReject}
          </Button>
        </div>
      </div>
    </div>
  );
}
