import { MessagingView } from "@/components/messaging/messaging-view";
import { resolveUserId } from "@/lib/supabase/auth";
import { getUserConversations } from "@/services/conversation.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

interface DashboardMessagesPageProps {
  searchParams: Promise<{ c?: string }>;
}

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.dashboard.messagesTitle,
    description: dict.dashboard.messagesSubtitle,
    path: "/dashboard/messages",
    noIndex: true,
    locale,
  });
}

export default async function DashboardMessagesPage({
  searchParams,
}: DashboardMessagesPageProps) {
  const dict = getDictionary(await getLocale());
  const userId = await resolveUserId();
  const conversations = await getUserConversations(userId);
  const params = await searchParams;
  const initialConversationId = params.c ?? null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900">{dict.dashboard.messagesTitle}</h1>
      <p className="mt-1 text-sm text-surface-500">{dict.messaging.pageSubtitle}</p>

      <div className="mt-8">
        <MessagingView
          userId={userId}
          initialConversations={conversations}
          initialConversationId={initialConversationId}
        />
      </div>
    </div>
  );
}
