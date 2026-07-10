"use client";

import { motion } from "framer-motion";
import { AlertCircle, Users } from "lucide-react";
import { searchBroadcastUsers } from "@/actions/admin-notification.actions";
import type { AdminBroadcastListResult } from "@/services/admin-notification.service";
import type { NotificationAudience } from "@/types/database";
import {
  BROADCAST_AUDIENCE_CARDS,
  getEstimatedAudienceCount,
  type BroadcastAudienceCardId,
  type BroadcastFormValidation,
} from "@/lib/admin/broadcast-display";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BroadcastAudienceBuilderProps {
  audience: NotificationAudience;
  cities: string[];
  targetCity: string;
  userQuery: string;
  userResults: { id: string; full_name: string | null; email: string }[];
  selectedUserId: string | null;
  broadcasts: AdminBroadcastListResult;
  validation: BroadcastFormValidation;
  onAudienceChange: (audience: NotificationAudience) => void;
  onTargetCityChange: (value: string) => void;
  onUserQueryChange: (value: string) => void;
  onUserResultsChange: (users: { id: string; full_name: string | null; email: string }[]) => void;
  onSelectedUserIdChange: (id: string | null) => void;
}

export function BroadcastAudienceBuilder({
  audience,
  cities,
  targetCity,
  userQuery,
  userResults,
  selectedUserId,
  broadcasts,
  validation,
  onAudienceChange,
  onTargetCityChange,
  onUserQueryChange,
  onUserResultsChange,
  onSelectedUserIdChange,
}: BroadcastAudienceBuilderProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;
  const audienceLabels = t.admin.notifications.audiences as Record<string, string>;

  const audienceLabelKeys: Record<BroadcastAudienceCardId, string> = {
    all_users: bc.audienceAllUsers,
    premium_users: bc.audiencePremium,
    verified_users: bc.audienceVerified,
    city_users: bc.audienceCity,
    single_user: bc.audienceSingle,
    boost_users: bc.audienceBoost,
    users_with_listings: bc.audienceListings,
    admins: bc.audienceAdmins,
  };

  const audienceDescriptions: Record<BroadcastAudienceCardId, string> = {
    all_users: bc.audienceAllUsersDesc,
    premium_users: bc.audiencePremiumDesc,
    verified_users: bc.audienceVerifiedDesc,
    city_users: bc.audienceCityDesc,
    single_user: bc.audienceSingleDesc,
    boost_users: bc.audienceBoostDesc,
    users_with_listings: bc.audienceListingsDesc,
    admins: bc.audienceAdminsDesc,
  };

  const estimatedCount = getEstimatedAudienceCount(
    audience,
    selectedUserId,
    targetCity,
    broadcasts
  );

  const handleSearchUsers = async (query: string) => {
    onUserQueryChange(query);
    if (query.trim().length < 2) {
      onUserResultsChange([]);
      return;
    }
    const result = await searchBroadcastUsers(query.trim());
    if ("users" in result && result.users) onUserResultsChange(result.users);
  };

  const audienceErrors: Record<string, string> = {
    singleUserRequired: bc.validationSingleUser,
    cityRequired: bc.validationCity,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-surface-900">{bc.audienceTitle}</h2>
          <p className="mt-1 text-sm text-surface-500">{bc.audienceSubtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50/80 px-3 py-2">
          <Users className="h-4 w-4 text-brand-600" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-surface-400">
              {bc.estimatedReach}
            </p>
            <p className="text-sm font-bold text-surface-900">
              {estimatedCount !== null
                ? bc.estimatedCount.replace("{count}", String(estimatedCount))
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {BROADCAST_AUDIENCE_CARDS.map((card, index) => {
          const Icon = card.icon;
          const isSelected = card.backendAudience === audience;
          const disabled = !card.available;

          return (
            <motion.button
              key={card.id}
              type="button"
              disabled={disabled}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={disabled ? undefined : { y: -2 }}
              onClick={() => {
                if (card.backendAudience) onAudienceChange(card.backendAudience);
              }}
              className={cn(
                "relative rounded-2xl border p-4 text-start transition-all",
                disabled
                  ? "cursor-not-allowed border-surface-100 bg-surface-50/50 opacity-70"
                  : isSelected
                    ? "border-brand-300 bg-brand-50/40 shadow-sm ring-2 ring-brand-500/20"
                    : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
              )}
            >
              {disabled && (
                <span className="absolute end-3 top-3 rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-semibold text-surface-500">
                  {t.admin.notifications.comingSoon}
                </span>
              )}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
                  card.accent
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <p className="mt-3 text-sm font-bold text-surface-900">
                {audienceLabelKeys[card.id]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-surface-500">
                {audienceDescriptions[card.id]}
              </p>
              {card.backendAudience && (
                <p className="mt-2 text-[10px] font-medium text-surface-400">
                  {audienceLabels[card.backendAudience]}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {validation.errors.audience && (
        <p className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3 w-3" />
          {audienceErrors[validation.errors.audience]}
        </p>
      )}

      {audience === "single_user" && (
        <div className="mt-4 rounded-xl border border-surface-200 bg-surface-50/50 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
            {t.admin.notifications.userSearchPlaceholder}
          </label>
          <Input
            value={userQuery}
            onChange={(event) => handleSearchUsers(event.target.value)}
            placeholder={t.admin.notifications.userSearchPlaceholder}
          />
          {userResults.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-auto rounded-xl border border-surface-200 bg-white">
              {userResults.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-start text-sm hover:bg-surface-50"
                    onClick={() => {
                      onSelectedUserIdChange(user.id);
                      onUserQueryChange(user.full_name || user.email);
                      onUserResultsChange([]);
                    }}
                  >
                    {user.full_name || user.email}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selectedUserId && (
            <p className="mt-2 text-xs font-semibold text-emerald-600">
              {t.admin.notifications.userSelected}
            </p>
          )}
        </div>
      )}

      {audience === "city_users" && (
        <div className="mt-4 rounded-xl border border-surface-200 bg-surface-50/50 p-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-surface-500">
            {t.admin.notifications.selectCity}
          </label>
          <select
            value={targetCity}
            onChange={(event) => onTargetCityChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-surface-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">{t.admin.notifications.selectCity}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}
    </motion.section>
  );
}
