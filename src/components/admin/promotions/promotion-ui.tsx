"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  BadgeCheck,
  ChevronDown,
  Gift,
  Headphones,
  Infinity,
  Landmark,
  ListPlus,
  MoreHorizontal,
  Rocket,
  Settings,
  Sparkles,
  Star,
  Store,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
  Gem,
} from "lucide-react";
import type { AdminGiftPaymentSource, AdminGiftType } from "@/types/database";
import type { AdminGiftRecipient } from "@/services/admin-promotion.service";
import { cn, getInitials } from "@/lib/utils";

export const RECENT_USERS_KEY = "finaura-promotion-recent-users";

export function saveRecentUser(user: AdminGiftRecipient) {
  try {
    const raw = localStorage.getItem(RECENT_USERS_KEY);
    const list: AdminGiftRecipient[] = raw ? JSON.parse(raw) : [];
    const filtered = [user, ...list.filter((u) => u.id !== user.id)].slice(0, 5);
    localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(filtered));
  } catch {
    /* ignore */
  }
}

export function loadRecentUsers(): AdminGiftRecipient[] {
  try {
    const raw = localStorage.getItem(RECENT_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  const [text, setText] = useState("0");

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    return display.on("change", (v) => setText(v));
  }, [display]);

  return <span>{text}</span>;
}

export function ConfettiBurst({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];

    for (let i = 0; i < 56; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position: fixed;
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 4}px;
        background: ${colors[i % colors.length]};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        top: 50%;
        left: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
      `;
      container.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 120 + Math.random() * 280;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 100;
      let x = 0;
      let y = 0;
      let opacity = 1;
      let frame = 0;

      const animate = () => {
        frame++;
        x += vx * 0.016;
        y += vy * 0.016 + frame * 0.4;
        opacity -= 0.011;
        piece.style.transform = `translate(${x}px, ${y}px) rotate(${frame * 8}deg)`;
        piece.style.opacity = String(Math.max(0, opacity));
        if (opacity > 0) requestAnimationFrame(animate);
        else piece.remove();
      };
      requestAnimationFrame(animate);
    }
  }, [active]);

  return <div ref={ref} className="pointer-events-none fixed inset-0 z-[200]" aria-hidden />;
}

export const GIFT_TYPE_VISUALS: Record<
  AdminGiftType,
  { Icon: LucideIcon; gradient: string; ring: string; iconColor: string }
> = {
  unlimited_listings: {
    Icon: Infinity,
    gradient: "from-violet-500/15 to-indigo-600/10",
    ring: "ring-violet-200/80",
    iconColor: "text-violet-600",
  },
  extra_listing_credits: {
    Icon: ListPlus,
    gradient: "from-sky-500/15 to-blue-600/10",
    ring: "ring-sky-200/80",
    iconColor: "text-sky-600",
  },
  premium_subscription: {
    Icon: Star,
    gradient: "from-amber-500/15 to-orange-600/10",
    ring: "ring-amber-200/80",
    iconColor: "text-amber-600",
  },
  premium_extension: {
    Icon: Star,
    gradient: "from-amber-500/15 to-yellow-500/10",
    ring: "ring-amber-200/80",
    iconColor: "text-amber-600",
  },
  featured_listing_credits: {
    Icon: Sparkles,
    gradient: "from-fuchsia-500/15 to-pink-600/10",
    ring: "ring-fuchsia-200/80",
    iconColor: "text-fuchsia-600",
  },
  boost_credits: {
    Icon: Rocket,
    gradient: "from-orange-500/15 to-red-500/10",
    ring: "ring-orange-200/80",
    iconColor: "text-orange-600",
  },
  custom_gift: {
    Icon: Gem,
    gradient: "from-emerald-500/15 to-teal-600/10",
    ring: "ring-emerald-200/80",
    iconColor: "text-emerald-600",
  },
  discount_coupon: {
    Icon: Ticket,
    gradient: "from-rose-500/15 to-pink-600/10",
    ring: "ring-rose-200/80",
    iconColor: "text-rose-600",
  },
};

export const RECOMMENDED_GIFT_TYPES: AdminGiftType[] = [
  "premium_subscription",
  "extra_listing_credits",
];

export const PAYMENT_SOURCE_ICONS: Record<AdminGiftPaymentSource, LucideIcon> = {
  gift: Gift,
  cash: Banknote,
  bank_transfer: Landmark,
  admin_compensation: Users,
  promotion: Ticket,
  support: Headphones,
  other: Settings,
};

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
}: {
  name?: string | null;
  email?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-16 w-16 text-lg",
  }[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-50 font-bold text-brand-700 ring-2 ring-white shadow-sm",
        sizeClass
      )}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill className="object-cover" />
      ) : (
        getInitials(name || email || "?")
      )}
    </div>
  );
}

export function PlanBadge({ planSlug, planName }: { planSlug?: string | null; planName?: string | null }) {
  const isPremium = planSlug === "pro" || planSlug === "enterprise";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        isPremium
          ? "bg-amber-50 text-amber-700 ring-amber-200"
          : "bg-surface-100 text-surface-600 ring-surface-200"
      )}
    >
      {isPremium && <Star className="h-2.5 w-2.5" />}
      {planName ?? (isPremium ? "Premium" : "Free")}
    </span>
  );
}

export function VerifiedBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200/80">
      <BadgeCheck className="h-3 w-3" />
      {label}
    </span>
  );
}

export function SellerBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
      <Store className="h-3 w-3" />
      {label}
    </span>
  );
}

export function UserBadgeRow({
  planSlug,
  planName,
  isPremium,
  isSeller,
  verifiedLabel,
  sellerLabel,
}: {
  planSlug?: string | null;
  planName?: string | null;
  isPremium?: boolean;
  isSeller?: boolean;
  verifiedLabel?: string;
  sellerLabel?: string;
}) {
  const showPremium = isPremium ?? (planSlug === "pro" || planSlug === "enterprise");
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PlanBadge planSlug={planSlug} planName={planName} />
      {showPremium && verifiedLabel && <VerifiedBadge label={verifiedLabel} />}
      {isSeller && sellerLabel && <SellerBadge label={sellerLabel} />}
    </div>
  );
}

export function TrendIndicator({
  label,
  positive = true,
}: {
  label: string;
  positive?: boolean;
}) {
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <p
      className={cn(
        "mt-3 flex items-center gap-1 text-[11px] font-medium",
        positive ? "text-emerald-600" : "text-surface-500"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </p>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
  accent,
  trend,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  accent: string;
  trend?: { label: string; positive?: boolean };
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border border-surface-200/60 bg-gradient-to-br p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.08)]",
          accent
        )}
      >
        <div className="pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl transition-transform duration-500 group-hover:scale-110" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-surface-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-surface-900">
              <AnimatedCounter value={value} />
            </p>
            {trend && <TrendIndicator label={trend.label} positive={trend.positive} />}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/[0.04]",
              iconClass
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function PremiumCard({
  children,
  className,
  padding = "lg",
}: {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}) {
  const pad = { sm: "p-4", md: "p-5", lg: "p-6 sm:p-8", none: "" }[padding];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-2xl border border-surface-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]",
        pad,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function EmptyStateIllustration({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
      >
        <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-br from-brand-100/60 to-violet-100/40 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-50 to-violet-50 ring-1 ring-surface-200/80 shadow-xl">
          <Gift className="h-10 w-10 text-brand-500" />
        </div>
      </motion.div>
      <p className="mt-8 text-lg font-semibold tracking-tight text-surface-900">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-surface-500">{subtitle}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Gift className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="overflow-hidden rounded-2xl border border-surface-200/80 bg-surface-50/40 shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start transition-colors hover:bg-surface-100/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        <div>
          <p className="text-sm font-semibold text-surface-900">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-surface-500">{subtitle}</p>}
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-surface-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-surface-200/80 px-5 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-surface-900">
      {children}
    </label>
  );
}

export function FieldHelper({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-surface-500">{children}</p>;
}

export function PaymentSourceBadge({ source, label }: { source: AdminGiftPaymentSource; label: string }) {
  const Icon = PAYMENT_SOURCE_ICONS[source] ?? Settings;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700 ring-1 ring-surface-200/80">
      <Icon className="h-3.5 w-3.5 text-surface-500" />
      {label}
    </span>
  );
}

export function GiftTypeSelectCard({
  type,
  selected,
  title,
  description,
  benefits,
  recommendedLabel,
  onSelect,
}: {
  type: AdminGiftType;
  selected: boolean;
  title: string;
  description: string;
  benefits: string[];
  recommendedLabel?: string;
  onSelect: () => void;
}) {
  const visual = GIFT_TYPE_VISUALS[type];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col rounded-2xl border p-5 text-start transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        selected
          ? "border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-500/20"
          : "border-surface-200/80 bg-white hover:border-surface-300 hover:shadow-sm"
      )}
    >
      {recommendedLabel && (
        <span className="absolute end-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
          {recommendedLabel}
        </span>
      )}
      <div className="flex items-start gap-4">
        <motion.div
          animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset",
            visual.gradient,
            visual.ring
          )}
        >
          <visual.Icon className={cn("h-6 w-6", visual.iconColor)} />
        </motion.div>
        <div className="min-w-0 flex-1 pe-6">
          <p className="text-sm font-bold text-surface-900">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-surface-500">{description}</p>
        </div>
      </div>
      {benefits.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-surface-100 pt-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-xs text-surface-600">
              <span className="h-1 w-1 shrink-0 rounded-full bg-brand-400" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
    </motion.button>
  );
}

export function LivePreviewPanel({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("sticky top-6", className)}>
      <PremiumCard
        padding="md"
        className="border-surface-200/80 bg-gradient-to-b from-surface-50/90 via-white to-white"
      >
        <div className="flex items-center gap-2 border-b border-surface-100 pb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <Sparkles className="h-4 w-4 text-brand-600" />
          </div>
          <h3 className="text-sm font-bold text-surface-900">{title}</h3>
        </div>
        <div className="mt-4">{children}</div>
      </PremiumCard>
    </div>
  );
}

export function PreviewRow({
  label,
  children,
  highlight,
}: {
  label: string;
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium text-surface-500">{label}</dt>
      <dd
        className={cn(
          "max-w-[60%] text-end text-sm font-medium text-surface-900",
          highlight && "font-semibold text-brand-700"
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export type DropdownAction = {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
};

export function ActionDropdown({
  label,
  items,
}: {
  label: string;
  items: DropdownAction[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute end-0 z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-surface-200/80 bg-white py-1 shadow-xl ring-1 ring-black/5"
          >
            {items.map((item) => {
              const className = cn(
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-start text-sm transition-colors",
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-surface-700 hover:bg-surface-50",
                item.disabled && "pointer-events-none opacity-40"
              );
              const content = (
                <>
                  <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                  {item.label}
                </>
              );
              if (item.href && !item.disabled) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    className={className}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={className}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                >
                  {content}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
