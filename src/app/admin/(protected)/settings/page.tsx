import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export default async function AdminSettingsPage() {
  const dict = getDictionary(await getLocale());
  return (
    <AdminPlaceholder title={dict.admin.navSettings} description={dict.admin.comingSoon} />
  );
}
