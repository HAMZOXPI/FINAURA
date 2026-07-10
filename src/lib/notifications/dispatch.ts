import { buildNotificationFromTemplate } from "@/lib/notifications/templates";

import type { NotificationTemplateKey } from "@/lib/notifications/constants";

import { createNotification } from "@/services/notification.service";

import type { Locale } from "@/i18n/config";

import type { NotificationPriority, NotificationType } from "@/types/database";



async function dispatchTemplate(

  userId: string,

  templateKey: NotificationTemplateKey,

  vars: Record<string, string> = {},

  locale: Locale = "fr",

  dedupKey?: string

) {

  try {

    const content = buildNotificationFromTemplate(templateKey, locale, vars);

    await createNotification({

      userId,

      type: content.type,

      priority: content.priority,

      title: content.title,

      body: content.body,

      actionUrl: content.actionUrl,

      templateKey: content.templateKey,

      metadata: vars,

      dedupKey: dedupKey ?? `${templateKey}:${Object.values(vars).join(":")}`,

    });

  } catch (error) {

    console.error(`Notification dispatch failed (${templateKey}):`, error);

  }

}



export async function notifyVerificationApproved(userId: string) {

  await dispatchTemplate(userId, "verification_approved", {}, "fr", `verification_approved:${userId}`);

}



export async function notifyVerificationRejected(userId: string, reason: string) {

  await dispatchTemplate(

    userId,

    "verification_rejected",

    { reason },

    "fr",

    `verification_rejected:${userId}:${Date.now()}`

  );

}



export async function notifyPropertyApproved(userId: string, title: string, propertyId: string) {

  await dispatchTemplate(

    userId,

    "property_approved",

    { title, propertyId },

    "fr",

    `property_approved:${propertyId}`

  );

}



export async function notifyPropertyRejected(userId: string, title: string, reason: string, propertyId: string) {

  await dispatchTemplate(

    userId,

    "property_rejected",

    { title, reason, propertyId },

    "fr",

    `property_rejected:${propertyId}:${Date.now()}`

  );

}



export async function notifyPropertyHidden(userId: string, title: string, propertyId: string) {

  await dispatchTemplate(

    userId,

    "property_hidden",

    { title, propertyId },

    "fr",

    `property_hidden:${propertyId}`

  );

}



export async function notifyGiftGranted(userId: string, giftLabel: string, giftId?: string) {

  await dispatchTemplate(

    userId,

    "gift_granted",

    { giftLabel },

    "fr",

    giftId ? `gift_granted:${giftId}` : `gift_granted:${userId}:${Date.now()}`

  );

}



export async function notifyGiftExpired(userId: string, giftLabel: string, giftId: string) {

  await dispatchTemplate(

    userId,

    "gift_expired",

    { giftLabel },

    "fr",

    `gift_expired:${giftId}`

  );

}



export async function notifyNewMessage(userId: string, senderName: string, conversationId?: string) {

  await dispatchTemplate(

    userId,

    "new_message",

    { senderName },

    "fr",

    conversationId ? `new_message:${conversationId}` : `new_message:${userId}:${Date.now()}`

  );

}



export async function notifyPremiumActivated(userId: string, planName: string) {

  await dispatchTemplate(

    userId,

    "premium_activated",

    { planName },

    "fr",

    `premium_activated:${userId}:${Date.now()}`

  );

}



export async function notifyPremiumExpired(userId: string) {

  await dispatchTemplate(userId, "premium_expired", {}, "fr", `premium_expired:${userId}`);

}



export async function notifyPremiumExpiring(userId: string, planName: string, daysLeft: string) {

  await dispatchTemplate(

    userId,

    "premium_expiring",

    { planName, daysLeft },

    "fr",

    `premium_expiring:${userId}:${daysLeft}`

  );

}



export async function notifySubscriptionChanged(userId: string, planName: string) {

  await dispatchTemplate(

    userId,

    "subscription_changed",

    { planName },

    "fr",

    `subscription_changed:${userId}:${Date.now()}`

  );

}



export async function notifySubscriptionRenewed(userId: string, planName: string) {

  await dispatchTemplate(

    userId,

    "subscription_renewed",

    { planName },

    "fr",

    `subscription_renewed:${userId}:${Date.now()}`

  );

}



export async function notifySubscriptionExpired(userId: string, planName: string) {

  await dispatchTemplate(

    userId,

    "subscription_expired",

    { planName },

    "fr",

    `subscription_expired:${userId}`

  );

}



export async function notifyPaymentConfirmed(userId: string, amount: string, paymentId?: string) {

  await dispatchTemplate(

    userId,

    "payment_confirmed",

    { amount },

    "fr",

    paymentId ? `payment_confirmed:${paymentId}` : `payment_confirmed:${userId}:${Date.now()}`

  );

}



export async function notifyReportListing(userId: string, title: string, propertyId: string) {

  await dispatchTemplate(

    userId,

    "report_listing",

    { title, propertyId },

    "fr",

    `report_listing:${propertyId}:${Date.now()}`

  );

}



export async function notifyCustom(

  userId: string,

  params: {

    type: NotificationType;

    priority: NotificationPriority;

    title: string;

    body: string;

    actionUrl?: string | null;

    metadata?: Record<string, unknown>;

    broadcastId?: string | null;

    templateKey?: string | null;

    dedupKey?: string | null;

  }

) {

  try {

    await createNotification({

      userId,

      type: params.type,

      priority: params.priority,

      title: params.title,

      body: params.body,

      actionUrl: params.actionUrl,

      metadata: params.metadata,

      broadcastId: params.broadcastId,

      templateKey: params.templateKey,

      dedupKey: params.dedupKey,

    });

  } catch (error) {

    console.error("Custom notification dispatch failed:", error);

  }

}



export async function notifyBoostOutbid(params: {
  userId: string;
  listingId: string;
  position: number;
  winningAmount: number;
}) {
  await dispatchTemplate(
    params.userId,
    "boost_outbid",
    {
      position: String(params.position),
      winningAmount: String(params.winningAmount),
      listingId: params.listingId,
    },
    "fr",
    `boost_outbid:${params.listingId}:${params.position}:${params.winningAmount}`
  );
}


