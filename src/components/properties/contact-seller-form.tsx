"use client";

import { useState, useTransition } from "react";
import { submitContactInquiry } from "@/actions/property.actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

interface ContactSellerFormProps {
  propertyId: string;
  defaultName?: string;
  defaultEmail?: string;
}

export function ContactSellerForm({
  propertyId,
  defaultName = "",
  defaultEmail = "",
}: ContactSellerFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const result = await submitContactInquiry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-900">{t.contact.sentTitle}</h3>
        <p className="text-sm text-emerald-700">{t.contact.sentDesc}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="property_id" value={propertyId} />

      <Input
        id="sender_name"
        name="sender_name"
        label={t.contact.yourName}
        defaultValue={defaultName}
        required
      />
      <Input
        id="sender_email"
        name="sender_email"
        type="email"
        label={t.contact.email}
        defaultValue={defaultEmail}
        required
      />
      <Input
        id="sender_phone"
        name="sender_phone"
        type="tel"
        label={t.contact.phoneOptional}
      />
      <Textarea
        id="message"
        name="message"
        label={t.contact.message}
        placeholder={t.contact.messagePlaceholder}
        required
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" isLoading={isPending}>
        {t.contact.send}
      </Button>
    </form>
  );
}
