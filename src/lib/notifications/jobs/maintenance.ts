import { markExpiredGifts } from "@/services/gift.service";
import { BoostBiddingService } from "@/services/boost-bidding.service";

import { createClient } from "@/lib/supabase/server";

import { notifyGiftExpired } from "@/lib/notifications/dispatch";



export async function processExpiredGiftNotifications(): Promise<number> {

  const supabase = await createClient();

  const now = new Date().toISOString();



  const { data: expiringGifts } = await supabase

    .from("admin_gifts")

    .select("id, user_id, gift_type")

    .eq("status", "active")

    .not("expires_at", "is", null)

    .lte("expires_at", now);



  if (!expiringGifts?.length) return 0;



  await markExpiredGifts();



  await Promise.all(

    expiringGifts.map((gift) =>

      notifyGiftExpired(

        gift.user_id,

        String(gift.gift_type).replace(/_/g, " "),

        gift.id

      )

    )

  );



  return expiringGifts.length;

}



export async function processPremiumExpiringNotifications(): Promise<number> {

  const supabase = await createClient();

  const now = new Date();

  const inSevenDays = new Date(now);

  inSevenDays.setDate(inSevenDays.getDate() + 7);



  const { data: subscriptions } = await supabase

    .from("user_subscriptions")

    .select("user_id, current_period_end, plan:subscription_plans(name, slug)")

    .eq("status", "active")

    .not("current_period_end", "is", null)

    .gte("current_period_end", now.toISOString())

    .lte("current_period_end", inSevenDays.toISOString());



  if (!subscriptions?.length) return 0;



  const { notifyPremiumExpiring } = await import("@/lib/notifications/dispatch");



  await Promise.all(

    subscriptions.map((sub) => {

      const plan = sub.plan as { name?: string; slug?: string } | null;

      const end = new Date(sub.current_period_end as string);

      const daysLeft = Math.max(1, Math.ceil((end.getTime() - now.getTime()) / 86400000));

      return notifyPremiumExpiring(

        sub.user_id,

        plan?.name ?? "Premium",

        String(daysLeft)

      );

    })

  );



  return subscriptions.length;

}



export async function processExpiredBoostCampaigns(): Promise<number> {
  return BoostBiddingService.expireDueCampaigns();
}



export async function runNotificationMaintenanceJobs(): Promise<{

  cleaned: number;

  expiredGifts: number;

  premiumExpiring: number;

  expiredBoosts: number;

}> {

  const { cleanupOldNotifications } = await import("@/services/notification.service");



  const [cleaned, expiredGifts, premiumExpiring, expiredBoosts] = await Promise.all([

    cleanupOldNotifications(),

    processExpiredGiftNotifications(),

    processPremiumExpiringNotifications(),

    processExpiredBoostCampaigns(),

  ]);



  return { cleaned, expiredGifts, premiumExpiring, expiredBoosts };

}


