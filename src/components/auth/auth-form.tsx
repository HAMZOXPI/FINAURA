"use client";

import { useActionState, type InputHTMLAttributes } from "react";
import { Lock, Mail, User } from "lucide-react";
import { signIn, signUp } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo?: string;
  forgotPasswordLabel?: string;
}

type AuthState = { error?: string } | null;

function PremiumField({
  icon: Icon,
  label,
  id,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof Mail;
  label?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Icon
          className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id={id}
          className={cn(
            "flex h-14 w-full rounded-2xl border border-surface-200 bg-white ps-12 text-base text-surface-900 transition-all duration-200 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function AuthForm({ mode, redirectTo, forgotPasswordLabel }: AuthFormProps) {
  const { t } = useTranslation();
  const isLogin = mode === "login";
  const serverAction = isLogin ? signIn : signUp;

  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthState, formData: FormData): Promise<AuthState> => {
      if (redirectTo) {
        formData.set("redirect", redirectTo);
      }
      const result = await serverAction(formData);
      return result ?? null;
    },
    null
  );

  if (isLogin) {
    return (
      <form action={formAction} className="space-y-5">
        <PremiumField
          id="email"
          name="email"
          type="email"
          icon={Mail}
          label={t.auth.email}
          placeholder={t.auth.emailPlaceholder}
          required
        />

        <div className="space-y-2">
          <PremiumField
            id="password"
            name="password"
            type="password"
            icon={Lock}
            label={t.auth.password}
            placeholder="••••••••"
            minLength={6}
            required
          />
          {forgotPasswordLabel && (
            <div className="flex justify-end">
              <span className="text-sm font-medium text-brand-600">{forgotPasswordLabel}</span>
            </div>
          )}
        </div>

        {state?.error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
        )}

        <Button
          type="submit"
          className="h-14 w-full rounded-2xl text-base font-semibold shadow-[0_8px_24px_-8px_rgba(0,105,198,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_12px_28px_-8px_rgba(0,105,198,0.5)]"
          isLoading={isPending}
        >
          {t.auth.signIn}
        </Button>

        <div className="border-t border-surface-100 pt-6 text-center">
          <p className="text-sm text-surface-500">{t.auth.noAccount}</p>
          <Button
            href="/register"
            variant="outline"
            className="mt-3 h-12 w-full rounded-2xl border-surface-200 text-base font-semibold text-surface-700 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700"
          >
            {t.auth.createAccountBtn}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <PremiumField
        id="full_name"
        name="full_name"
        icon={User}
        label={t.auth.fullName}
        placeholder={t.auth.fullNamePlaceholder}
        required
      />

      <PremiumField
        id="email"
        name="email"
        type="email"
        icon={Mail}
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        required
      />

      <PremiumField
        id="password"
        name="password"
        type="password"
        icon={Lock}
        label={t.auth.password}
        placeholder="••••••••"
        minLength={6}
        required
      />

      {state?.error && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <Button
        type="submit"
        className="h-14 w-full rounded-2xl text-base font-semibold shadow-[0_8px_24px_-8px_rgba(0,105,198,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-[0_12px_28px_-8px_rgba(0,105,198,0.5)]"
        isLoading={isPending}
      >
        {t.auth.createAccountBtn}
      </Button>

      <div className="border-t border-surface-100 pt-6 text-center">
        <p className="text-sm text-surface-500">{t.auth.hasAccount}</p>
        <Button
          href="/login"
          variant="outline"
          className="mt-3 h-12 w-full rounded-2xl border-surface-200 text-base font-semibold text-surface-700 transition-all duration-200 hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700"
        >
          {t.auth.signIn}
        </Button>
      </div>
    </form>
  );
}
