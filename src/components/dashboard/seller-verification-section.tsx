"use client";

import { useRef, useState, useTransition } from "react";
import {
  BadgeCheck,
  Clock,
  FileImage,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Upload,
} from "lucide-react";
import { submitVerificationRequest } from "@/actions/verification.actions";
import type { Profile, VerificationRequest } from "@/types/database";
import type { SellerVerificationStatus } from "@/services/verification.service";
import { createClient } from "@/lib/supabase/client";
import { uploadVerificationDocuments } from "@/lib/verification/upload-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerVerificationSectionProps {
  profile: Profile | null;
  latestRequest: VerificationRequest | null;
  status: SellerVerificationStatus;
}

function StatusBadge({ status }: { status: SellerVerificationStatus }) {
  const { t } = useTranslation();

  const config = {
    not_verified: {
      label: t.dashboard.verificationNotVerified,
      icon: ShieldOff,
      className: "bg-surface-100 text-surface-700",
    },
    pending: {
      label: t.dashboard.verificationPending,
      icon: Clock,
      className: "bg-amber-50 text-amber-800",
    },
    verified: {
      label: t.dashboard.verificationVerified,
      icon: ShieldCheck,
      className: "bg-emerald-50 text-emerald-800",
    },
    rejected: {
      label: t.dashboard.verificationRejected,
      icon: ShieldAlert,
      className: "bg-red-50 text-red-800",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
        config.className
      )}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

function FileField({
  id,
  label,
  hint,
  required = true,
  accept,
}: {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-surface-900">
            {label}
            {!required && (
              <span className="ms-1 text-xs font-normal text-surface-500">({hint})</span>
            )}
          </label>
          {required && <p className="mt-1 text-xs text-surface-500">{hint}</p>}
        </div>
        <FileImage className="h-5 w-5 shrink-0 text-brand-600" />
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="file"
          accept={accept}
          required={required}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {fileName || "Choose file"}
        </Button>
        {fileName && (
          <span className="truncate text-xs text-surface-500">{fileName}</span>
        )}
      </div>
    </div>
  );
}

export function SellerVerificationSection({
  profile,
  latestRequest,
  status,
}: SellerVerificationSectionProps) {
  const { t, locale } = useTranslation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSubmit = status === "not_verified" || status === "rejected";

  const handleSubmit = (formData: FormData) => {
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const idFront = formData.get("id_front") as File | null;
      const idBack = formData.get("id_back") as File | null;
      const selfie = formData.get("selfie") as File | null;
      const proofOfAddress = formData.get("proof_of_address") as File | null;

      if (!idFront?.size || !idBack?.size || !selfie?.size) {
        setError("Please upload all required documents");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Unauthorized");
        return;
      }

      const requestId = crypto.randomUUID();
      const uploadResult = await uploadVerificationDocuments(user.id, requestId, {
        idFront,
        idBack,
        selfie,
        proofOfAddress,
      });

      if (uploadResult.error || !uploadResult.paths) {
        setError(uploadResult.error ?? "Upload failed");
        return;
      }

      const result = await submitVerificationRequest({
        requestId,
        idFrontPath: uploadResult.paths.idFrontPath,
        idBackPath: uploadResult.paths.idBackPath,
        selfiePath: uploadResult.paths.selfiePath,
        proofOfAddressPath: uploadResult.paths.proofOfAddressPath,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
    });
  };

  return (
    <section className="space-y-5 rounded-2xl border border-surface-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-surface-900">
              {t.dashboard.verificationTitle}
            </h2>
          </div>
          <p className="mt-1 text-sm text-surface-500">{t.dashboard.verificationSubtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {status === "verified" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t.dashboard.verificationVerifiedMessage}
        </div>
      )}

      {status === "pending" && latestRequest && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>{t.dashboard.verificationPendingMessage}</p>
          <p className="mt-2 text-xs text-amber-800/80">
            {t.dashboard.verificationSubmittedOn}{" "}
            {formatDate(latestRequest.created_at, locale)}
          </p>
        </div>
      )}

      {status === "rejected" && latestRequest?.rejection_reason && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">{t.dashboard.verificationRejectionReason}</p>
          <p className="mt-1">{latestRequest.rejection_reason}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t.dashboard.verificationSubmittedSuccess}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {canSubmit && (
        <form action={handleSubmit} className="space-y-4">
          <p className="text-sm text-surface-600">{t.dashboard.verificationFormIntro}</p>

          <FileField
            id="id_front"
            label={t.dashboard.verificationIdFront}
            hint={t.dashboard.verificationFileHint}
            accept="image/jpeg,image/png,image/webp"
          />
          <FileField
            id="id_back"
            label={t.dashboard.verificationIdBack}
            hint={t.dashboard.verificationFileHint}
            accept="image/jpeg,image/png,image/webp"
          />
          <FileField
            id="selfie"
            label={t.dashboard.verificationSelfie}
            hint={t.dashboard.verificationSelfieHint}
            accept="image/jpeg,image/png,image/webp"
          />
          <FileField
            id="proof_of_address"
            label={t.dashboard.verificationProofOfAddress}
            hint={t.dashboard.verificationOptional}
            required={false}
            accept="image/jpeg,image/png,image/webp,application/pdf"
          />

          <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
            {status === "rejected"
              ? t.dashboard.verificationResubmit
              : t.dashboard.verificationSubmit}
          </Button>
        </form>
      )}

      {!canSubmit && status !== "verified" && profile && (
        <p className="text-xs text-surface-500">{t.dashboard.verificationLockedHint}</p>
      )}
    </section>
  );
}
