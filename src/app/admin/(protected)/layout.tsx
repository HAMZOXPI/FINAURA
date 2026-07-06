import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin-auth";
import { createMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return createMetadata({
    title: dict.admin.panelTitle,
    description: dict.admin.panelDescription,
    path: "/admin",
    noIndex: true,
    locale,
  });
}

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  const userName =
    profile.full_name ??
    (user.user_metadata?.full_name as string) ??
    user.email?.split("@")[0] ??
    "Admin";

  return (
    <AdminShell userName={userName} userEmail={user.email ?? ""}>
      {children}
    </AdminShell>
  );
}
