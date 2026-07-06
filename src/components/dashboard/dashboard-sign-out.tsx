"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";

export function DashboardSignOut() {
  const { t } = useTranslation();

  return (
    <form action={signOut} className="mt-4 border-t border-surface-200 pt-4">
      <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
        <LogOut className="h-4 w-4" />
        {t.dashboard.signOut}
      </Button>
    </form>
  );
}
