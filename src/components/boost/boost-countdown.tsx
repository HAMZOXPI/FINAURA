"use client";

import { AnimatePresence, motion } from "framer-motion";
import { padCountdown, useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/locale-provider";

interface BoostCountdownProps {
  expiresAt: string | null;
  className?: string;
  compact?: boolean;
  variant?: "dark" | "light";
  urgency?: boolean;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

function getUrgencyClasses(
  totalMs: number,
  variant: "dark" | "light",
  urgency: boolean
): { text: string; pulse: boolean } {
  if (!urgency || totalMs <= 0) {
    return {
      text: variant === "light" ? "text-amber-700" : "text-amber-200",
      pulse: false,
    };
  }

  if (totalMs < ONE_HOUR_MS) {
    return {
      text: variant === "light" ? "text-red-600" : "text-red-300",
      pulse: true,
    };
  }

  if (totalMs < ONE_DAY_MS) {
    return {
      text: variant === "light" ? "text-orange-600" : "text-orange-300",
      pulse: false,
    };
  }

  return {
    text: variant === "light" ? "text-amber-700" : "text-amber-200",
    pulse: false,
  };
}

export function BoostCountdown({
  expiresAt,
  className,
  compact = false,
  variant = "dark",
  urgency = false,
}: BoostCountdownProps) {
  const { t } = useTranslation();
  const countdown = useCountdown(expiresAt);
  const expiredClass = variant === "light" ? "text-surface-400" : "text-white/50";
  const { text: urgencyClass, pulse } = getUrgencyClasses(
    countdown.totalMs,
    variant,
    urgency
  );

  if (!expiresAt || countdown.expired) {
    return (
      <span className={cn("text-xs font-medium", expiredClass, className)}>
        {t.boost.expired}
      </span>
    );
  }

  if (compact) {
    const parts = [
      countdown.days > 0 ? `${countdown.days}d` : null,
      `${padCountdown(countdown.hours)}h`,
      `${padCountdown(countdown.minutes)}m`,
      `${padCountdown(countdown.seconds)}s`,
    ].filter(Boolean);

    const display = parts.join(" ");

    return (
      <span
        className={cn(
          "inline-flex font-mono text-sm font-semibold tabular-nums transition-colors duration-500",
          urgencyClass,
          pulse && "animate-pulse",
          className
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ opacity: 0.6, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      {countdown.days > 0 && (
        <CountdownUnit
          value={countdown.days}
          label={t.boost.daysShort}
          urgencyClass={urgencyClass}
        />
      )}
      <CountdownUnit
        value={countdown.hours}
        label={t.boost.hoursShort}
        urgencyClass={urgencyClass}
      />
      <CountdownUnit
        value={countdown.minutes}
        label={t.boost.minutesShort}
        urgencyClass={urgencyClass}
      />
      <CountdownUnit
        value={countdown.seconds}
        label={t.boost.secondsShort}
        urgencyClass={urgencyClass}
        pulse={pulse}
      />
    </div>
  );
}

function CountdownUnit({
  value,
  label,
  urgencyClass,
  pulse = false,
}: {
  value: number;
  label: string;
  urgencyClass: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-[2.75rem] flex-col items-center rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 backdrop-blur-sm sm:min-w-[3rem]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0.5, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "font-mono text-base font-bold tabular-nums sm:text-lg",
            urgencyClass,
            pulse && "animate-pulse"
          )}
        >
          {padCountdown(value)}
        </motion.span>
      </AnimatePresence>
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
        {label}
      </span>
    </div>
  );
}
