"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";
import type { UserSubscription, SubscriptionPlan } from "@/types/database";
import { useTranslation } from "@/i18n/locale-provider";
import { formatPlanPrice, interpolate } from "@/lib/utils";
import { getPlanDisplayPrice } from "@/lib/pricing/pricing-display";

interface ProfileSettingsFormProps {
  profile: Profile | null;
  email: string;
  subscription: (UserSubscription & { plan: SubscriptionPlan }) | null;
}

export function ProfileSettingsForm({
  profile,
  email,
  subscription,
}: ProfileSettingsFormProps) {
  const { t, locale } = useTranslation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = await updateUserProfile(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage(t.dashboard.profileSaved);
      }
    });
  };

  return (
    <div className="space-y-8">
      <form action={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-surface-900">{t.dashboard.settingsTitle}</h2>

        <Input
          id="full_name"
          name="full_name"
          label={t.auth.fullName}
          defaultValue={profile?.full_name ?? ""}
          required
        />

        <Input id="email" label={t.auth.email} defaultValue={email} disabled />

        <Input
          id="phone"
          name="phone"
          label={t.dashboard.phone}
          type="tel"
          defaultValue={profile?.phone ?? ""}
          placeholder={t.dashboard.phonePlaceholder}
        />

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <Button type="submit" isLoading={isPending}>
          {t.dashboard.saveProfile}
        </Button>
      </form>

      {subscription && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-surface-900">{t.dashboard.subscription}</h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-surface-900">
                {subscription.plan.name}
              </p>
              <p className="text-sm text-surface-500">
                {formatPlanPrice(getPlanDisplayPrice(subscription.plan), locale)}
                {t.dashboard.perMonth} · {subscription.status}
              </p>
              {subscription.plan.max_listings !== null && (
                <p className="text-sm text-surface-500">
                  {interpolate(t.pricing.upToListings, {
                    count: subscription.plan.max_listings,
                  })}
                </p>
              )}
            </div>
            <a href="/pricing">
              <Button variant="outline" size="sm">
                {t.dashboard.upgradePlan}
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
