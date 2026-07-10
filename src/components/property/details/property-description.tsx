"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface PropertyDescriptionProps {
  description: string;
}

const COLLAPSE_LENGTH = 320;

export function PropertyDescription({ description }: PropertyDescriptionProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > COLLAPSE_LENGTH;
  const displayText =
    !isLong || expanded ? description : `${description.slice(0, COLLAPSE_LENGTH).trim()}…`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="property-description-heading"
      className="rounded-[24px] border border-surface-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)]"
    >
      <h2
        id="property-description-heading"
        className="sticky top-20 z-10 bg-white/95 py-2 text-xl font-bold text-surface-900 backdrop-blur-sm sm:text-2xl lg:static lg:bg-transparent lg:py-0"
      >
        {t.properties.description}
      </h2>

      <p
        className={cn(
          "mt-5 text-base leading-[1.85] text-surface-600 sm:text-lg sm:leading-[1.9]",
          !expanded && isLong && "line-clamp-6"
        )}
      >
        {displayText}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-brand-600 transition-colors duration-[250ms] hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2"
        >
          {expanded ? t.propertyDetail.readLess : t.propertyDetail.readMore}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-[250ms]", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    </motion.section>
  );
}
