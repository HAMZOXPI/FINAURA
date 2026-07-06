import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export default async function AdminSubscriptionsPage() {
  const dict = getDictionary(await getLocale());
  return (
    <AdminPlaceholder
      title={dict.admin.navSubscriptions}
      description={dict.admin.comingSoon}
    />
  );
}
