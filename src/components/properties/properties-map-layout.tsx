"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPinned } from "lucide-react";
import type { Property } from "@/types/database";
import { PropertyMapListCard } from "@/components/properties/property-map-list-card";
import { PropertiesEmptyState } from "@/components/properties/properties-empty-state";
import { PropertiesMapSkeleton } from "@/components/properties/properties-map-skeleton";
import { useTranslation } from "@/i18n/locale-provider";

const PropertiesLeafletMap = dynamic(
  () =>
    import("@/components/properties/properties-leaflet-map").then(
      (module) => module.PropertiesLeafletMap
    ),
  {
    ssr: false,
    loading: () => <PropertiesMapSkeleton />,
  }
);

interface PropertiesMapLayoutProps {
  properties: Property[];
  onClearFilters: () => void;
}

export function PropertiesMapLayout({ properties, onClearFilters }: PropertiesMapLayoutProps) {
  const { t, locale } = useTranslation();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    properties[0]?.id ?? null
  );
  const [pulsePropertyId, setPulsePropertyId] = useState<string | null>(null);
  const [recenterToken, setRecenterToken] = useState(0);
  const pulseTimeoutRef = useRef<number | null>(null);

  const handleSelectFromCard = (property: Property) => {
    setSelectedPropertyId(property.id);
    setPulsePropertyId(property.id);
    setRecenterToken((token) => token + 1);

    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
    }

    pulseTimeoutRef.current = window.setTimeout(() => {
      setPulsePropertyId(null);
      pulseTimeoutRef.current = null;
    }, 300);
  };

  const handleSelectFromMarker = (property: Property) => {
    setSelectedPropertyId(property.id);
    setRecenterToken((token) => token + 1);
  };

  if (properties.length === 0) {
    return <PropertiesEmptyState onClear={onClearFilters} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative"
    >
      {/* Single map instance — avoids Leaflet init in hidden duplicate containers */}
      <div className="relative h-[calc(100vh-18rem)] min-h-[420px] w-full overflow-hidden rounded-[24px] border border-surface-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] lg:min-h-[640px]">
        <aside className="absolute inset-y-0 start-0 z-[401] hidden w-[400px] overflow-y-auto border-e border-surface-200 bg-white p-4 lg:block">
          <div className="mb-4 flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-brand-600" />
            <p className="text-sm font-semibold text-surface-900">{t.properties.mapListingsTitle}</p>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {properties.map((property) => (
                <PropertyMapListCard
                  key={property.id}
                  property={property}
                  isActive={property.id === selectedPropertyId}
                  onSelect={handleSelectFromCard}
                />
              ))}
            </AnimatePresence>
          </div>
        </aside>

        <div className="absolute inset-0 z-0 lg:start-[400px]">
          <PropertiesLeafletMap
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            pulsePropertyId={pulsePropertyId}
            recenterToken={recenterToken}
            onSelectProperty={handleSelectFromMarker}
            locale={locale}
          />
        </div>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-200 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-lg lg:hidden"
      >
        <div className="container-app">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-surface-500">
            {t.properties.mapSwipeHint}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {properties.map((property) => (
              <div key={property.id} className="w-[280px] shrink-0">
                <PropertyMapListCard
                  property={property}
                  isActive={property.id === selectedPropertyId}
                  onSelect={handleSelectFromCard}
                />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
