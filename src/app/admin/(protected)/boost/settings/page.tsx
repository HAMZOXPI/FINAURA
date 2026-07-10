import { AdminBoostSettingsForm } from "@/components/admin/boost/admin-boost-settings-form";
import { getAdminBoostProducts } from "@/services/admin-boost.service";
import { getBoostSettings } from "@/services/boost-settings.service";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.boost.settingsTitle,
    description: dict.admin.boost.settingsSubtitle,
    path: "/admin/boost/settings",
    noIndex: true,
    locale,
  });
}

export default async function AdminBoostSettingsPage() {
  const [settings, products] = await Promise.all([
    getBoostSettings(),
    getAdminBoostProducts(),
  ]);

  return <AdminBoostSettingsForm settings={settings} products={products} />;
}
