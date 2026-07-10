"use client";

import { motion } from "framer-motion";
import {
  buildVerificationWorkflowSteps,
  type WorkflowStepState,
} from "@/lib/admin/verification-review-drawer-display";
import type { VerificationRequestStatus } from "@/types/database";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface VerificationReviewTimelineProps {
  status: VerificationRequestStatus;
}

function stepStyles(state: WorkflowStepState) {
  switch (state) {
    case "complete":
      return {
        dot: "bg-emerald-500 ring-emerald-200",
        line: "bg-emerald-400",
        text: "text-emerald-700",
        card: "border-emerald-200/80 bg-emerald-50/60",
      };
    case "active":
      return {
        dot: "bg-orange-500 ring-orange-200 animate-pulse",
        line: "bg-gradient-to-b from-emerald-400 to-orange-300",
        text: "text-orange-700",
        card: "border-orange-200/80 bg-orange-50/70 shadow-sm",
      };
    case "rejected":
      return {
        dot: "bg-red-500 ring-red-200",
        line: "bg-red-300",
        text: "text-red-700",
        card: "border-red-200/80 bg-red-50/60",
      };
    default:
      return {
        dot: "bg-surface-300 ring-surface-200",
        line: "bg-surface-200",
        text: "text-surface-400",
        card: "border-surface-200/80 bg-surface-50/50",
      };
  }
}

export function VerificationReviewTimeline({ status }: VerificationReviewTimelineProps) {
  const { t } = useTranslation();

  const steps = buildVerificationWorkflowSteps(status, {
    submitted: t.admin.verifications.workflow.submitted,
    underReview: t.admin.verifications.workflow.underReview,
    approved: t.admin.verifications.workflow.approved,
    rejected: t.admin.verifications.workflow.rejected,
  });

  return (
    <section
      aria-label={t.admin.verifications.workflow.title}
      className="rounded-2xl border border-surface-200/80 bg-white p-4 shadow-sm"
    >
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-surface-400">
        {t.admin.verifications.workflow.title}
      </h3>
      <ol className="relative mt-4 space-y-0 ps-1">
        {steps.map((step, index) => {
          const styles = stepStyles(step.state);
          const isLast = index === steps.length - 1;

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className="relative flex gap-3 pb-5 last:pb-0"
            >
              {!isLast && (
                <motion.span
                  aria-hidden
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.08 + 0.12, duration: 0.35 }}
                  className={cn(
                    "absolute start-[11px] top-6 h-[calc(100%-12px)] w-0.5 origin-top",
                    styles.line
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-[1] mt-0.5 h-6 w-6 shrink-0 rounded-full ring-4 ring-white",
                  styles.dot
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-xl border px-3 py-2.5 transition-shadow hover:shadow-md",
                  styles.card
                )}
              >
                <p className={cn("text-sm font-semibold", styles.text)}>{step.label}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
