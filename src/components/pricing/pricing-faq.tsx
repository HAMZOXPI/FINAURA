"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Clock,
  CreditCard,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

export function PricingFaq() {
  const { t } = useTranslation();
  const faq = t.pricing.faq;
  const [openId, setOpenId] = useState<string | null>("cancel");

  const items: { id: string; question: string; answer: string; icon: LucideIcon }[] = [
    { id: "cancel", question: faq.cancelQuestion, answer: faq.cancelAnswer, icon: ShieldCheck },
    { id: "how", question: faq.howQuestion, answer: faq.howAnswer, icon: HelpCircle },
    { id: "upgrade", question: faq.upgradeQuestion, answer: faq.upgradeAnswer, icon: RefreshCw },
    { id: "billing", question: faq.billingQuestion, answer: faq.billingAnswer, icon: CreditCard },
    { id: "expires", question: faq.expiresQuestion, answer: faq.expiresAnswer, icon: Clock },
  ];

  return (
    <section className="bg-surface-50/60 py-14 sm:py-20 lg:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {faq.title}
          </h2>
          <p className="mt-3 text-surface-500">{faq.subtitle}</p>
        </motion.div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3 sm:mt-10">
          {items.map((item, index) => {
            const isOpen = openId === item.id;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow",
                  isOpen && "border-brand-200/60 shadow-[0_12px_32px_rgba(0,105,198,0.08)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-4 px-4 py-4 text-start transition-colors hover:bg-surface-50/80 sm:px-6 sm:py-5"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors",
                      isOpen
                        ? "bg-brand-50 text-brand-600 ring-brand-100"
                        : "bg-surface-50 text-surface-500 ring-surface-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 font-semibold text-surface-900">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-surface-400 transition-transform duration-300",
                      isOpen && "rotate-180 text-brand-500"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      <div className="border-t border-surface-100 px-4 pb-5 ps-[4.5rem] pt-3 text-sm leading-relaxed text-surface-600 sm:px-6 sm:ps-[5.5rem]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
