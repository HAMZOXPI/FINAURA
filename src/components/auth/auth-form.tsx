"use client";

import { useActionState } from "react";
import { signIn, signUp } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/i18n/locale-provider";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo?: string;
}

type AuthState = { error?: string } | null;

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const { t } = useTranslation();
  const serverAction = mode === "login" ? signIn : signUp;

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

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" && (
        <Input
          id="full_name"
          name="full_name"
          label={t.auth.fullName}
          placeholder={t.auth.fullNamePlaceholder}
          required
        />
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label={t.auth.password}
        placeholder="••••••••"
        minLength={6}
        required
      />

      {state?.error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <Button type="submit" className="w-full" isLoading={isPending}>
        {mode === "login" ? t.auth.signIn : t.auth.createAccountBtn}
      </Button>

      <p className="text-center text-sm text-surface-500">
        {mode === "login" ? (
          <>
            {t.auth.noAccount}{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">
              {t.auth.signUp}
            </Link>
          </>
        ) : (
          <>
            {t.auth.hasAccount}{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              {t.auth.signIn}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
