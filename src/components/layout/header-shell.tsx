import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/services/user.service";

export async function HeaderShell() {
  const user = await getCurrentUser();

  return (
    <Header
      user={
        user
          ? {
              id: user.id,
              email: user.email ?? "",
              fullName: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "User",
            }
          : null
      }
    />
  );
}
