"use client";

import { motion } from "framer-motion";
import { CreditCard, HeartHandshake, Shield, Users } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function PricingTrustSection() {
  const { t } = useTranslation();
  const trust = t.pricing.trust;

  const items = [
    {
      icon: Users,
      title: trust.professionalsTitle,
      description: trust.professionalsDesc,
    },
    {
      icon: Shield,
      title: trust.secureTitle,
      description: trust.secureDesc,
    },
    {
      icon: HeartHandshake,
      title: trust.supportTitle,
      description: trust.supportDesc,
    },
    {
      icon: CreditCard,
      title: trust.communityTitle,
      description: trust.communityDesc,
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[1.75rem] border border-surface-200/60 bg-gradient-to-br from-white via-brand-50/20 to-violet-50/20 px-5 py-10 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_16px_48px_rgba(0,0,0,0.05)] sm:rounded-[2rem] sm:px-10 sm:py-14 lg:py-16"
        >
          <div className="pointer-events-none absolute -end-20 -top-20 h-56 w-56 rounded-full bg-brand-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
              {trust.title}
            </h2>
            <p className="mt-3 text-surface-500">{trust.subtitle}</p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-white/80 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm"
              >
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-bold text-surface-900">{item.title}</h3>
                <p className="mt-1.5 text-sm text-surface-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
