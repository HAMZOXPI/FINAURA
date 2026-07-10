"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ActiveVerificationChip } from "@/lib/admin/verifications-display";

interface AdminVerificationsActiveChipsProps {
  chips: ActiveVerificationChip[];
}

export function AdminVerificationsActiveChips({ chips }: AdminVerificationsActiveChipsProps) {
  if (chips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="flex flex-wrap gap-2"
    >
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <motion.button
            key={chip.key}
            type="button"
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            onClick={chip.onRemove}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/80 transition-colors hover:bg-brand-100"
          >
            {chip.label}
            <X className="h-3 w-3 opacity-70" />
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
