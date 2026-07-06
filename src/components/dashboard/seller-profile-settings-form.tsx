"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { updateSellerProfile, uploadSellerAvatar } from "@/actions/seller.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface SellerProfileSettingsFormProps {
  profile: Profile | null;
}

export function SellerProfileSettingsForm({ profile }: SellerProfileSettingsFormProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUpload] = useTransition();

  const name = profile?.full_name ?? t.properties.defaultAgent;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setError("");
    setMessage("");

    startUpload(async () => {
      const result = await uploadSellerAvatar(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.avatarUrl) {
        setAvatarUrl(result.avatarUrl);
        setMessage(t.dashboard.sellerProfileSaved);
      }
    });
  };

  const handleSubmit = (formData: FormData) => {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await updateSellerProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage(t.dashboard.sellerProfileSaved);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5 rounded-2xl border border-surface-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-semibold text-surface-900">{t.dashboard.sellerProfileTitle}</h2>
        <p className="mt-1 text-sm text-surface-500">{t.dashboard.sellerProfileSubtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100"
          aria-label={t.dashboard.changePhoto}
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill className="object-cover" sizes="80px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-brand-50 text-xl font-bold text-brand-700">
              {getInitials(name)}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5 text-white" />
          </span>
        </button>
        <div>
          <p className="text-sm font-medium text-surface-900">{t.dashboard.profilePhoto}</p>
          <p className="text-xs text-surface-500">{t.dashboard.profilePhotoHint}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {isUploading ? t.dashboard.uploadingPhoto : t.dashboard.changePhoto}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-surface-700">
          {t.dashboard.bio}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={profile?.bio ?? ""}
          placeholder={t.dashboard.bioPlaceholder}
          className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm text-surface-800 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <Input
        id="seller_phone"
        name="phone"
        label={t.dashboard.phone}
        type="tel"
        defaultValue={profile?.phone ?? ""}
        placeholder={t.dashboard.phonePlaceholder}
      />

      <Input
        id="avg_response_time_hours"
        name="avg_response_time_hours"
        label={t.dashboard.avgResponseTime}
        type="number"
        min={0}
        max={168}
        step={0.5}
        defaultValue={profile?.avg_response_time_hours ?? 2}
      />

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>
      )}

      <Button type="submit" isLoading={isPending}>
        {t.dashboard.saveSellerProfile}
      </Button>
    </form>
  );
}
