import type { NotificationAudience, NotificationPriority, NotificationType } from "@/types/database";



export const NOTIFICATION_PRIORITIES: NotificationPriority[] = [

  "info",

  "success",

  "warning",

  "error",

];



export const NOTIFICATION_TYPES: NotificationType[] = [

  "verification_approved",

  "verification_rejected",

  "property_approved",

  "property_rejected",

  "property_hidden",

  "premium_activated",

  "premium_expired",

  "premium_expiring",

  "gift_granted",

  "gift_expired",

  "payment_confirmed",

  "subscription_changed",

  "subscription_renewed",

  "subscription_expired",

  "new_message",

  "report_listing",

  "admin_broadcast",

  "system",

];



export const BROADCAST_AUDIENCES: NotificationAudience[] = [

  "all_users",

  "premium_users",

  "verified_users",

  "city_users",

  "single_user",

];



export const NOTIFICATION_TEMPLATE_KEYS = [

  "verification_approved",

  "verification_rejected",

  "property_approved",

  "property_rejected",

  "property_hidden",

  "premium_activated",

  "premium_expired",

  "premium_expiring",

  "gift_granted",

  "gift_expired",

  "payment_confirmed",

  "subscription_changed",

  "subscription_renewed",

  "subscription_expired",

  "new_message",

  "report_listing",

] as const;



export type NotificationTemplateKey = (typeof NOTIFICATION_TEMPLATE_KEYS)[number];



export const TEMPLATE_DEFAULTS: Record<

  NotificationTemplateKey,

  { type: NotificationType; priority: NotificationPriority }

> = {

  verification_approved: { type: "verification_approved", priority: "success" },

  verification_rejected: { type: "verification_rejected", priority: "error" },

  property_approved: { type: "property_approved", priority: "success" },

  property_rejected: { type: "property_rejected", priority: "error" },

  property_hidden: { type: "property_hidden", priority: "warning" },

  premium_activated: { type: "premium_activated", priority: "success" },

  premium_expired: { type: "premium_expired", priority: "warning" },

  premium_expiring: { type: "premium_expiring", priority: "warning" },

  gift_granted: { type: "gift_granted", priority: "success" },

  gift_expired: { type: "gift_expired", priority: "warning" },

  payment_confirmed: { type: "payment_confirmed", priority: "success" },

  subscription_changed: { type: "subscription_changed", priority: "info" },

  subscription_renewed: { type: "subscription_renewed", priority: "success" },

  subscription_expired: { type: "subscription_expired", priority: "warning" },

  new_message: { type: "new_message", priority: "info" },

  report_listing: { type: "report_listing", priority: "warning" },

};



export const DROPDOWN_NOTIFICATION_LIMIT = 10;

export const NOTIFICATION_PAGE_SIZE = 15;



export const MOROCCAN_CITIES = [

  "Casablanca",

  "Rabat",

  "Marrakech",

  "Fès",

  "Tanger",

  "Agadir",

  "Meknès",

  "Oujda",

  "Kenitra",

  "Tétouan",

  "Salé",

  "Nador",

  "Mohammedia",

  "El Jadida",

  "Beni Mellal",

] as const;


