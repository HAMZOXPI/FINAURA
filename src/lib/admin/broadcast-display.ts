import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Crown,
  Rocket,
  ShieldCheck,
  User,
  Users,
  MapPin,
} from "lucide-react";
import type { AdminBroadcastListResult } from "@/services/admin-notification.service";
import type { NotificationAudience, NotificationPriority, NotificationType } from "@/types/database";

export const BROADCAST_TITLE_MAX = 80;
export const BROADCAST_BODY_MAX = 500;

export type BroadcastAudienceCardId =
  | NotificationAudience
  | "boost_users"
  | "users_with_listings"
  | "admins";

export type BroadcastDeliveryMode = "send_now" | "schedule" | "draft" | "recurring";

export type BroadcastPreviewMode = "desktop" | "mobile" | "dark";

export interface BroadcastAudienceCardConfig {
  id: BroadcastAudienceCardId;
  backendAudience: NotificationAudience | null;
  available: boolean;
  icon: LucideIcon;
  accent: string;
}

export interface BroadcastTemplate {
  id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  notificationType: NotificationType;
  actionUrl: string;
}

export interface BroadcastFormValidation {
  valid: boolean;
  errors: {
    title?: string;
    body?: string;
    audience?: string;
    actionUrl?: string;
  };
}

export const BROADCAST_AUDIENCE_CARDS: BroadcastAudienceCardConfig[] = [
  {
    id: "all_users",
    backendAudience: "all_users",
    available: true,
    icon: Users,
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "premium_users",
    backendAudience: "premium_users",
    available: true,
    icon: Crown,
    accent: "bg-amber-50 text-amber-600",
  },
  {
    id: "verified_users",
    backendAudience: "verified_users",
    available: true,
    icon: ShieldCheck,
    accent: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "city_users",
    backendAudience: "city_users",
    available: true,
    icon: MapPin,
    accent: "bg-sky-50 text-sky-600",
  },
  {
    id: "single_user",
    backendAudience: "single_user",
    available: true,
    icon: User,
    accent: "bg-brand-50 text-brand-600",
  },
  {
    id: "boost_users",
    backendAudience: null,
    available: false,
    icon: Rocket,
    accent: "bg-orange-50 text-orange-600",
  },
  {
    id: "users_with_listings",
    backendAudience: null,
    available: false,
    icon: Building2,
    accent: "bg-purple-50 text-purple-600",
  },
  {
    id: "admins",
    backendAudience: null,
    available: false,
    icon: ShieldCheck,
    accent: "bg-surface-100 text-surface-600",
  },
];

export const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  {
    id: "promotion",
    title: "Offre exclusive Premium",
    body: "Profitez de -20 % sur votre abonnement Premium cette semaine. Offre limitée.",
    priority: "success",
    notificationType: "premium_activated",
    actionUrl: "/pricing",
  },
  {
    id: "verification_approved",
    title: "Vérification approuvée",
    body: "Félicitations ! Votre compte vendeur est maintenant vérifié.",
    priority: "success",
    notificationType: "verification_approved",
    actionUrl: "/dashboard/settings",
  },
  {
    id: "verification_rejected",
    title: "Vérification refusée",
    body: "Votre demande de vérification a été refusée. Consultez les détails et soumettez à nouveau.",
    priority: "warning",
    notificationType: "verification_rejected",
    actionUrl: "/dashboard/settings",
  },
  {
    id: "boost_expired",
    title: "Votre boost a expiré",
    body: "Le boost de votre annonce est terminé. Relancez une campagne pour rester visible.",
    priority: "warning",
    notificationType: "boost_expired",
    actionUrl: "/dashboard/boost",
  },
  {
    id: "system_maintenance",
    title: "Maintenance planifiée",
    body: "Une maintenance est prévue ce soir de 23h à 1h. Le service peut être temporairement indisponible.",
    priority: "info",
    notificationType: "system",
    actionUrl: "",
  },
  {
    id: "new_feature",
    title: "Nouvelle fonctionnalité disponible",
    body: "Découvrez notre nouvel outil de messagerie intégrée pour contacter les acheteurs plus rapidement.",
    priority: "info",
    notificationType: "admin_broadcast",
    actionUrl: "/dashboard/messages",
  },
  {
    id: "welcome",
    title: "Bienvenue sur Finaura",
    body: "Merci de nous rejoindre ! Publiez votre première annonce et explorez le marché immobilier marocain.",
    priority: "success",
    notificationType: "admin_broadcast",
    actionUrl: "/dashboard/new",
  },
];

export function validateBroadcastForm(input: {
  title: string;
  body: string;
  audience: NotificationAudience;
  selectedUserId: string | null;
  targetCity: string;
  actionUrl: string;
}): BroadcastFormValidation {
  const errors: BroadcastFormValidation["errors"] = {};

  const title = input.title.trim();
  const body = input.body.trim();

  if (title.length < 2) {
    errors.title = "minLength";
  } else if (title.length > BROADCAST_TITLE_MAX) {
    errors.title = "maxLength";
  }

  if (body.length < 2) {
    errors.body = "minLength";
  } else if (body.length > BROADCAST_BODY_MAX) {
    errors.body = "maxLength";
  }

  if (input.audience === "single_user" && !input.selectedUserId) {
    errors.audience = "singleUserRequired";
  }

  if (input.audience === "city_users" && !input.targetCity.trim()) {
    errors.audience = "cityRequired";
  }

  if (input.actionUrl.trim() && !/^(\/|https?:\/\/)/.test(input.actionUrl.trim())) {
    errors.actionUrl = "invalidUrl";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getEstimatedAudienceCount(
  audience: NotificationAudience,
  selectedUserId: string | null,
  targetCity: string,
  broadcasts: AdminBroadcastListResult
): number | null {
  if (audience === "single_user") {
    return selectedUserId ? 1 : null;
  }

  if (audience === "city_users") {
    if (!targetCity.trim()) return null;
    const match = broadcasts.rows.find(
      (row) => row.audience === "city_users" && row.target_city === targetCity.trim()
    );
    return match?.recipient_count ?? null;
  }

  const match = broadcasts.rows.find((row) => row.audience === audience);
  return match?.recipient_count ?? null;
}

export function getBroadcastStatus(
  deliveredCount: number,
  recipientCount: number
): "delivered" | "partial" | "pending" {
  if (recipientCount <= 0) return "pending";
  if (deliveredCount >= recipientCount) return "delivered";
  if (deliveredCount > 0) return "partial";
  return "pending";
}
