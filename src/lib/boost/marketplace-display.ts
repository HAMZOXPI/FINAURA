import type { BoostPositionEstimates } from "@/lib/boost/estimates";

/** UI-only: convert backend estimate percentages into marketing figures. */
const BASE_IMPRESSIONS = 2850;
const BASE_CLICKS = 120;
const BASE_LEADS = 31;

function formatMarketingPlus(value: number): string {
  if (value >= 1000) {
    const rounded = Math.floor(value / 100) * 100;
    return `${rounded.toLocaleString()}+`;
  }
  return `${Math.max(1, Math.round(value))}+`;
}

export function formatMarketingEstimates(estimates: BoostPositionEstimates) {
  const impressions = Math.round(
    BASE_IMPRESSIONS * (estimates.estimatedVisibility / 100)
  );
  const clicks = Math.round(BASE_CLICKS * (estimates.estimatedClicks / 100));
  const leads = Math.round(BASE_LEADS * (estimates.estimatedLeads / 100));

  return {
    impressions: formatMarketingPlus(impressions),
    clicks: formatMarketingPlus(clicks),
    leads: formatMarketingPlus(leads),
  };
}

export interface PositionTheme {
  medal: string;
  gradient: string;
  border: string;
  ring: string;
  glow: string;
  hoverGlow: string;
  accentText: string;
  accentMuted: string;
  iconBg: string;
  isPremium: boolean;
}

export const POSITION_THEMES: Record<number, PositionTheme> = {
  1: {
    medal: "🥇",
    gradient:
      "from-amber-500/35 via-yellow-600/20 to-amber-950/30",
    border: "border-amber-400/50",
    ring: "ring-amber-400/20",
    glow: "shadow-[0_0_48px_rgba(251,191,36,0.22),0_8px_32px_rgba(0,0,0,0.4)]",
    hoverGlow:
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_0_60px_rgba(251,191,36,0.32),0_12px_40px_rgba(0,0,0,0.45)]",
    accentText: "text-amber-100",
    accentMuted: "text-amber-200/80",
    iconBg: "bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/40",
    isPremium: true,
  },
  2: {
    medal: "🥈",
    gradient: "from-slate-300/25 via-slate-400/12 to-slate-900/25",
    border: "border-slate-300/35",
    ring: "ring-slate-300/15",
    glow: "shadow-[0_4px_24px_rgba(148,163,184,0.12)]",
    hoverGlow:
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_32px_rgba(148,163,184,0.2)]",
    accentText: "text-slate-100",
    accentMuted: "text-slate-300/80",
    iconBg: "bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/30",
    isPremium: false,
  },
  3: {
    medal: "🥉",
    gradient: "from-orange-700/25 via-amber-800/12 to-stone-900/25",
    border: "border-orange-600/35",
    ring: "ring-orange-500/15",
    glow: "shadow-[0_4px_24px_rgba(180,83,9,0.12)]",
    hoverGlow:
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_32px_rgba(180,83,9,0.2)]",
    accentText: "text-orange-100",
    accentMuted: "text-orange-200/75",
    iconBg: "bg-gradient-to-br from-orange-600 to-amber-800 shadow-orange-600/30",
    isPremium: false,
  },
  4: {
    medal: "",
    gradient: "from-sky-500/20 via-blue-600/10 to-slate-900/25",
    border: "border-sky-400/30",
    ring: "ring-sky-400/12",
    glow: "shadow-[0_4px_24px_rgba(56,189,248,0.1)]",
    hoverGlow:
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_32px_rgba(56,189,248,0.18)]",
    accentText: "text-sky-100",
    accentMuted: "text-sky-200/75",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/25",
    isPremium: false,
  },
  5: {
    medal: "",
    gradient: "from-violet-500/20 via-purple-600/10 to-slate-900/25",
    border: "border-violet-400/30",
    ring: "ring-violet-400/12",
    glow: "shadow-[0_4px_24px_rgba(139,92,246,0.1)]",
    hoverGlow:
      "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_8px_32px_rgba(139,92,246,0.18)]",
    accentText: "text-violet-100",
    accentMuted: "text-violet-200/75",
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25",
    isPremium: false,
  },
};

export function getPositionTheme(position: number): PositionTheme {
  return POSITION_THEMES[position] ?? POSITION_THEMES[5];
}
