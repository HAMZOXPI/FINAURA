import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { HeaderShell } from "@/components/layout/header-shell";
import { Footer } from "@/components/layout/footer";
import { PageTransition } from "@/components/layout/page-transition";
import { MotionProvider } from "@/components/layout/motion-provider";
import { MobileChatFullscreenProvider } from "@/components/messaging/mobile-chat-fullscreen-context";
import { UnreadMessagesProvider } from "@/components/messaging/unread-messages-provider";
import { NotificationsProvider } from "@/components/notifications/notifications-provider";
import { GiftCelebrationProvider } from "@/components/gifts/gift-celebration-provider";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/seo/structured-data";
import { LocaleProvider } from "@/i18n/locale-provider";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { createMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/services/user.service";
import { getUnreadConversationCount } from "@/services/conversation.service";
import { getUnreadNotificationCount } from "@/services/notification.service";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    description: dict.meta.siteDescription,
    locale,
  });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadConversationCount(user.id) : 0;
  const notificationCount = user ? await getUnreadNotificationCount(user.id) : 0;
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdminRoute = pathname.startsWith("/admin");
  // Dashboard has its own persistent sidebar (nested layout), so its page
  // content is transitioned locally there instead of at the root — wrapping
  // it here too would remount the sidebar on every dashboard navigation.
  const hasOwnTransitionScope = isAdminRoute || pathname.startsWith("/dashboard");

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className="bg-surface-50">
      <body
        className={`${inter.variable} ${notoArabic.variable} ${
          locale === "ar" ? notoArabic.className : inter.className
        }`}
      >
        <MotionProvider>
          <LocaleProvider locale={locale} dictionary={dict}>
            <MobileChatFullscreenProvider>
            <UnreadMessagesProvider userId={user?.id ?? null} initialCount={unreadCount}>
              <NotificationsProvider userId={user?.id ?? null} initialCount={notificationCount}>
              <GiftCelebrationProvider userId={user?.id ?? null}>
              <OrganizationStructuredData />
              <WebsiteStructuredData />
              {!isAdminRoute && <HeaderShell />}
              {isAdminRoute ? (
                children
              ) : (
                <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden">
                  {hasOwnTransitionScope ? children : <PageTransition>{children}</PageTransition>}
                </main>
              )}
              {!isAdminRoute && <Footer />}
              </GiftCelebrationProvider>
              </NotificationsProvider>
            </UnreadMessagesProvider>
            </MobileChatFullscreenProvider>
          </LocaleProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
