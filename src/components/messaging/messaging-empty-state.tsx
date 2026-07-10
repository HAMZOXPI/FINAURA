"use client";

import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function MessagingEmptyState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[24px] border border-dashed border-brand-200/60 bg-gradient-to-b from-brand-50/50 via-white to-white px-6 py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-brand-200/40 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[28px] bg-white shadow-[0_12px_40px_-12px_rgba(0,105,198,0.25)] ring-1 ring-brand-100">
          <MessageSquare className="h-10 w-10 text-brand-600" />
        </div>
        <span className="absolute -end-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>
      <h3 className="text-xl font-bold text-surface-900">{t.messaging.noConversations}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface-500">
        {t.messaging.noConversationsHint}
      </p>
    </motion.div>
  );
}
