import { redirect } from "next/navigation";

export default function LegacyAdminVerificationRedirect() {
  redirect("/admin/verifications");
}
