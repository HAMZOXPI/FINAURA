"use client";

import { useState } from "react";
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
    <section>
      <h2 className="text-xl font-bold text-surface-900 sm:text-2xl">
        {t.properties.description}
      </h2>
      <p
        className={cn(
          "mt-4 text-base leading-8 text-surface-600 sm:text-lg sm:leading-8",
          !expanded && isLong && "line-clamp-6"
        )}
      >
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
        >
          {expanded ? t.propertyDetail.readLess : t.propertyDetail.readMore}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-[250ms]", expanded && "rotate-180")}
          />
        </button>
      )}
    </section>
  );
}
