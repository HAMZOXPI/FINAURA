"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UnreadCountBadge } from "@/components/messaging/unread-count-badge";
import { useUnreadMessages } from "@/components/messaging/unread-messages-provider";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/locale-provider";
import { cn, getInitials } from "@/lib/utils";
import { signOut } from "@/actions/auth.actions";

interface HeaderProps {
  user: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

const SCROLL_THRESHOLD = 48;

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => pathname !== "/");
  const { t } = useTranslation();
  const { unreadCount } = useUnreadMessages();

  const isHome = pathname === "/";
  const solid = !isHome || scrolled;

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/properties", label: t.nav.properties },
    { href: "/pricing", label: t.nav.pricing },
    { href: "/dashboard", label: t.nav.dashboard },
  ];

  const linkActiveClass = solid
    ? "bg-brand-50 text-brand-700"
    : "bg-white/15 text-white backdrop-blur-sm";
  const linkInactiveClass = solid
    ? "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
    : "text-white/85 hover:bg-white/10 hover:text-white";
  const linkActiveCheck = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header
      className={cn(
        "top-0 z-50 w-full transition-all duration-300 ease-out",
        isHome ? "fixed" : "sticky",
        solid
          ? "border-b border-surface-200/80 bg-white/95 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] backdrop-blur-lg"
          : "border-b border-transparent bg-transparent shadow-none backdrop-blur-none"
      )}
    >
      <div className="container-app flex h-16 items-center justify-between gap-3">
        <Logo variant={solid ? "default" : "light"} />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                linkActiveCheck(link.href) ? linkActiveClass : linkInactiveClass
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant={solid ? "light" : "dark"} />
          {user ? (
            <>
              <NotificationBell variant={solid ? "light" : "dark"} />
              <Link
                href="/dashboard/messages"
                className={cn(
                  "relative rounded-xl p-2 transition-colors duration-200",
                  solid
                    ? "text-surface-600 hover:bg-surface-100 hover:text-brand-600"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
                aria-label={t.nav.messages}
              >
                <MessageSquare className="h-5 w-5" />
                <UnreadCountBadge
                  count={unreadCount}
                  className="absolute -end-1 -top-1"
                />
              </Link>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors duration-200",
                  solid
                    ? "text-surface-700 hover:bg-surface-100"
                    : "text-white/90 hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    solid
                      ? "bg-brand-100 text-brand-700"
                      : "bg-white/20 text-white backdrop-blur-sm"
                  )}
                >
                  {getInitials(user.fullName)}
                </span>
                <span className="hidden lg:inline">{user.fullName}</span>
              </Link>
              <form action={signOut}>
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  className={cn(
                    !solid &&
                      "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  )}
                >
                  {t.nav.signOut}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors duration-200",
                  solid
                    ? "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {t.nav.login}
              </Link>
              <Link
                href="/register"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium shadow-sm transition-colors duration-200",
                  solid
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-white text-brand-700 hover:bg-white/90"
                )}
              >
                {t.nav.getStarted}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher variant={solid ? "light" : "dark"} />
          {user && <NotificationBell variant={solid ? "light" : "dark"} />}
          <button
            className={cn(
              "rounded-lg p-2 transition-colors duration-200",
              solid
                ? "text-surface-600 hover:bg-surface-100"
                : "text-white hover:bg-white/10"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t.nav.toggleMenu}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium",
                  linkActiveCheck(link.href) ? "bg-brand-50 text-brand-700" : "text-surface-600"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-surface-200 pt-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard/messages"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-surface-600"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t.nav.messages}
                    </span>
                    <UnreadCountBadge count={unreadCount} />
                  </Link>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {getInitials(user.fullName)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{user.fullName}</p>
                      <p className="text-xs text-surface-500">{user.email}</p>
                    </div>
                  </div>
                  <form action={signOut}>
                    <Button variant="outline" className="w-full" type="submit">
                      {t.nav.signOut}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-xl border border-surface-300 bg-white text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    {t.nav.getStarted}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
