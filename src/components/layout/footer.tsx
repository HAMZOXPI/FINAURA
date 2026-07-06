"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useTranslation } from "@/i18n/locale-provider";

const SOCIAL_LINKS = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "https://twitter.com", icon: Twitter, label: "X" },
];

export function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    [t.footer.product]: [
      { href: "/properties", label: t.home.browseProperties },
      { href: "/pricing", label: t.nav.pricing },
      { href: "/dashboard", label: t.nav.dashboard },
      { href: "/register", label: t.nav.getStarted },
    ],
    [t.footer.company]: [
      { href: "#", label: t.footer.about },
      { href: "#", label: t.footer.careers },
      { href: "#", label: t.footer.contact },
    ],
    [t.footer.legal]: [
      { href: "#", label: t.footer.privacy },
      { href: "#", label: t.footer.terms },
    ],
  };

  return (
    <footer className="border-t border-surface-800 bg-surface-950 text-white">
      <div className="container-app py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="[&_span:last-child]:text-white">
              <Logo />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {t.footer.tagline}
            </p>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {t.footer.followUs}
              </p>
              <div className="mt-4 flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:border-brand-500/50 hover:bg-brand-600/20 hover:text-white"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <ul className="mt-5 space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 transition-colors hover:text-brand-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white">{t.footer.newsletter}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/55">{t.footer.newsletterDesc}</p>
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder={t.footer.emailPlaceholder}
                className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
              >
                {t.footer.subscribe}
              </button>
            </form>
            <div className="mt-6">
              <LanguageSwitcher variant="dark" />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Finaura. {t.footer.rights}
          </p>
          <p className="text-xs text-white/30">Maroc · Immobilier premium</p>
        </div>
      </div>
    </footer>
  );
}
