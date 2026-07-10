"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";

export function PricingTestimonials() {
  const { t } = useTranslation();
  const testimonials = t.pricing.testimonials;

  const items = [
    {
      quote: testimonials.quote1,
      author: testimonials.author1,
      role: testimonials.role1,
      rating: 5,
    },
    {
      quote: testimonials.quote2,
      author: testimonials.author2,
      role: testimonials.role2,
      rating: 5,
    },
    {
      quote: testimonials.quote3,
      author: testimonials.author3,
      role: testimonials.role3,
      rating: 5,
    },
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {testimonials.title}
          </h2>
          <p className="mt-3 text-surface-500">{testimonials.subtitle}</p>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.blockquote
              key={item.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              className="flex h-full flex-col rounded-2xl border border-surface-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            >
              <Quote className="h-8 w-8 text-brand-200" />
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-surface-600">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-5 border-t border-surface-100 pt-4">
                <p className="font-semibold text-surface-900">{item.author}</p>
                <p className="text-xs text-surface-500">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
