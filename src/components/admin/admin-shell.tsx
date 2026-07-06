"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Flag,
  Gift,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const NAV_ITEMS = [
  { href: "/admin", labelKey: "navDashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", labelKey: "navUsers", icon: Users },
  { href: "/admin/properties", labelKey: "navProperties", icon: Building2 },
  { href: "/admin/verifications", labelKey: "navVerification", icon: ShieldCheck },
  { href: "/admin/promotions", labelKey: "navPromotions", icon: Gift },
  { href: "/admin/notifications", labelKey: "navNotifications", icon: Bell },
  { href: "/admin/reports", labelKey: "navReports", icon: Flag },
  { href: "/admin/subscriptions", labelKey: "navSubscriptions", icon: CreditCard },
  { href: "/admin/statistics", labelKey: "navStatistics", icon: BarChart3 },
  { href: "/admin/settings", labelKey: "navSettings", icon: Settings },
] as const;

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white/10 text-white"
                : "text-surface-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {t.admin[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

interface AdminShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export function AdminShell({ userName, userEmail, children }: AdminShellProps) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-100">
      <aside className="hidden w-64 shrink-0 border-e border-surface-800/50 bg-surface-950 lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-6">
          <Link href="/admin" className="block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Finaura
            </p>
            <p className="mt-1 text-lg font-bold text-white">{t.admin.panelTitle}</p>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks />
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-medium text-white">{userName}</p>
          <p className="truncate text-xs text-surface-400">{userEmail}</p>
          <Link
            href="/"
            className="mt-3 inline-flex text-xs font-medium text-brand-400 hover:text-brand-300"
          >
            {t.admin.backToSite}
          </Link>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col bg-surface-950 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Finaura
            </p>
            <p className="text-lg font-bold text-white">{t.admin.panelTitle}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-surface-400 hover:bg-white/10 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-surface-200 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-xl border border-surface-200 p-2 text-surface-700 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-surface-500">{t.admin.panelTitle}</p>
            <p className="truncate text-base font-semibold text-surface-900">{userName}</p>
          </div>
          <Link
            href="/"
            className="hidden rounded-xl border border-surface-200 px-3 py-2 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 sm:inline-flex"
          >
            {t.admin.backToSite}
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
