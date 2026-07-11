"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { Logo } from "@/components/layout/logo";
import { AuthForm } from "@/components/auth/auth-form";

interface LoginPageContentProps {
  locale: Locale;
  welcomeBadge: string;
  title: string;
  subtitle: string;
  checkEmailMessage?: string;
  redirectTo?: string;
  trustItems: [string, string, string];
  forgotPasswordLabel: string;
}

export function LoginPageContent({
  locale,
  welcomeBadge,
  title,
  subtitle,
  checkEmailMessage,
  redirectTo,
  trustItems,
  forgotPasswordLabel,
}: LoginPageContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 w-full max-w-[460px]"
    >
      <div className="rounded-[28px] border border-surface-200/80 bg-white p-6 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.14)] sm:p-8">
        <div className="text-center">
          <div className="flex flex-col items-center">
            <Logo className="justify-center" />
            <span className="mt-3 inline-flex items-center rounded-full border border-brand-200/60 bg-brand-50/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
              {welcomeBadge}
            </span>
          </div>
          <h1 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-surface-900 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-surface-500">{subtitle}</p>
        </div>

        {checkEmailMessage && (
          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {checkEmailMessage}
          </div>
        )}

        <div className="mt-8">
          <AuthForm
            mode="login"
            redirectTo={redirectTo}
            forgotPasswordLabel={forgotPasswordLabel}
          />
        </div>
      </div>

      <ul
        className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        aria-label={locale === "ar" ? "مزايا المنصة" : "Avantages Finaura"}
      >
        {trustItems.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-surface-400"
          >
            <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" strokeWidth={2.5} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
