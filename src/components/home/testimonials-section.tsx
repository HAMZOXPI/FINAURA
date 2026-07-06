"use client";

import { Quote } from "lucide-react";
import { useTranslation } from "@/i18n/locale-provider";
import { MotionSection, MotionStagger, MotionItem } from "@/components/home/motion-section";

export function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t.home.testimonial1Quote,
      name: t.home.testimonial1Name,
      role: t.home.testimonial1Role,
    },
    {
      quote: t.home.testimonial2Quote,
      name: t.home.testimonial2Name,
      role: t.home.testimonial2Role,
    },
    {
      quote: t.home.testimonial3Quote,
      name: t.home.testimonial3Name,
      role: t.home.testimonial3Role,
    },
  ];

  return (
    <section className="bg-gradient-to-b from-surface-50 to-white py-20 lg:py-28">
      <div className="container-app">
        <MotionSection className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {t.home.testimonialsTitle}
          </h2>
          <p className="mt-4 text-lg text-surface-500">{t.home.testimonialsSubtitle}</p>
        </MotionSection>

        <MotionStagger className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((item, index) => (
            <MotionItem key={index}>
              <figure className="flex h-full flex-col rounded-3xl border border-surface-200/80 bg-white p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.12)]">
                <Quote className="h-8 w-8 text-brand-200" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-surface-600">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-surface-100 pt-6">
                  <p className="font-semibold text-surface-900">{item.name}</p>
                  <p className="mt-1 text-sm text-surface-500">{item.role}</p>
                </figcaption>
              </figure>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </section>
  );
}
