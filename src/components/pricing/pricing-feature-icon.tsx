"use client";

import {
  BarChart3,
  Crown,
  Globe,
  Heart,
  MessageSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURE_ICONS: LucideIcon[] = [
  Sparkles,
  Rocket,
  ShieldCheck,
  BarChart3,
  Heart,
  MessageSquare,
  Zap,
  Crown,
  Globe,
];

interface PricingFeatureIconProps {
  index: number;
  iconBg: string;
  iconText: string;
}

export function PricingFeatureIcon({ index, iconBg, iconText }: PricingFeatureIconProps) {
  const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length];

  return (
    <span
      className={cn(
        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ring-1",
        iconBg,
        iconText
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
    </span>
  );
}
