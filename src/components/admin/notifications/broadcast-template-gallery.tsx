"use client";

import { motion } from "framer-motion";
import {
  Gift,
  Megaphone,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BROADCAST_TEMPLATES, type BroadcastTemplate } from "@/lib/admin/broadcast-display";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  promotion: Sparkles,
  verification_approved: ShieldCheck,
  verification_rejected: XCircle,
  boost_expired: Zap,
  system_maintenance: Wrench,
  new_feature: Megaphone,
  welcome: PartyPopper,
};

const TEMPLATE_ACCENTS: Record<string, string> = {
  promotion: "bg-purple-50 text-purple-600",
  verification_approved: "bg-emerald-50 text-emerald-600",
  verification_rejected: "bg-red-50 text-red-600",
  boost_expired: "bg-orange-50 text-orange-600",
  system_maintenance: "bg-surface-100 text-surface-600",
  new_feature: "bg-brand-50 text-brand-600",
  welcome: "bg-amber-50 text-amber-600",
};

interface BroadcastTemplateGalleryProps {
  selectedTemplateId: string | null;
  onSelect: (template: BroadcastTemplate) => void;
}

export function BroadcastTemplateGallery({
  selectedTemplateId,
  onSelect,
}: BroadcastTemplateGalleryProps) {
  const { t } = useTranslation();
  const bc = t.admin.notifications.broadcastCenter;

  const templateLabels: Record<string, string> = {
    promotion: bc.templatePromotion,
    verification_approved: bc.templateVerificationApproved,
    verification_rejected: bc.templateVerificationRejected,
    boost_expired: bc.templateBoostExpired,
    system_maintenance: bc.templateMaintenance,
    new_feature: bc.templateNewFeature,
    welcome: bc.templateWelcome,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-surface-200/80 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold tracking-tight text-surface-900">{bc.templatesTitle}</h2>
        <p className="mt-1 text-sm text-surface-500">{bc.templatesSubtitle}</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {BROADCAST_TEMPLATES.map((template, index) => {
          const Icon = TEMPLATE_ICONS[template.id] ?? Gift;
          const isSelected = selectedTemplateId === template.id;

          return (
            <motion.button
              key={template.id}
              type="button"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => onSelect(template)}
              className={cn(
                "min-w-[160px] shrink-0 rounded-2xl border p-4 text-start transition-all",
                isSelected
                  ? "border-brand-300 bg-brand-50/40 ring-2 ring-brand-500/20"
                  : "border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-black/[0.04]",
                  TEMPLATE_ACCENTS[template.id] ?? "bg-surface-100 text-surface-600"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <p className="mt-3 text-sm font-bold text-surface-900">
                {templateLabels[template.id] ?? template.id}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-surface-500">{template.title}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.section>
  );
}
