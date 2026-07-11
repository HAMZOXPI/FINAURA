"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface FinauraPremiumCrownProps {
  className?: string;
}

/**
 * Custom Finaura Premium crown — minimal luxury geometry with metallic gold gradient.
 * ViewBox 48×48; renders at 42px (mobile) / 48px (sm+).
 */
export function FinauraPremiumCrown({ className }: FinauraPremiumCrownProps) {
  const uid = useId().replace(/:/g, "");
  const gold = `fpc-gold-${uid}`;
  const highlight = `fpc-hi-${uid}`;
  const specular = `fpc-spec-${uid}`;
  const shadow = `fpc-shadow-${uid}`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[42px] w-[42px] shrink-0 sm:h-12 sm:w-12", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gold} x1="24" y1="13" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D774" />
          <stop offset="46%" stopColor="#E8BC3D" />
          <stop offset="100%" stopColor="#C89211" />
        </linearGradient>
        <linearGradient id={highlight} x1="17" y1="14" x2="31" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFDF6" stopOpacity="0.75" />
          <stop offset="42%" stopColor="#F7D774" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C89211" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={specular} x1="22" y1="15" x2="26" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F7D774" stopOpacity="0" />
        </linearGradient>
        <filter id={shadow} x="-8%" y="-6%" width="116%" height="122%">
          <feDropShadow dx="0" dy="0.55" stdDeviation="0.22" floodColor="#6E5208" floodOpacity="0.26" />
        </filter>
      </defs>

      {/* Engraved depth layer */}
      <path
        d="M13.5 32.25L16.25 23.25L19.25 28.5L24 15.25L28.75 28.5L31.75 23.25L34.5 32.25H35.5Q37.5 32.25 37.5 34.25V36.75H10.5V34.25Q10.5 32.25 12.5 32.25H13.5Z"
        fill="#9A7010"
        fillOpacity="0.14"
        transform="translate(0 0.65)"
      />

      {/* Main crown silhouette */}
      <path
        d="M13.5 32.25L16.25 23.25L19.25 28.5L24 15.25L28.75 28.5L31.75 23.25L34.5 32.25H35.5Q37.5 32.25 37.5 34.25V36.75H10.5V34.25Q10.5 32.25 12.5 32.25H13.5Z"
        fill={`url(#${gold})`}
        filter={`url(#${shadow})`}
      />

      {/* Soft inner shadow on peaks */}
      <path
        d="M19.25 28.5L24 15.25L28.75 28.5"
        fill="#C89211"
        fillOpacity="0.1"
      />

      {/* Metallic highlight wash */}
      <path
        d="M13.5 32.25L16.25 23.25L19.25 28.5L24 15.25L28.75 28.5L31.75 23.25L34.5 32.25H35.5Q37.5 32.25 37.5 34.25V36.75H10.5V34.25Q10.5 32.25 12.5 32.25H13.5Z"
        fill={`url(#${highlight})`}
      />

      {/* Delicate edge lines — thin luxury strokes */}
      <path
        d="M16.25 23.25L19.25 28.5L24 15.25L28.75 28.5L31.75 23.25"
        stroke="#F7D774"
        strokeWidth="0.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.42"
      />
      <path
        d="M10.75 34.75H37.25"
        stroke="#E8BC3D"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Center peak specular highlight */}
      <path
        d="M23.1 17.5L24 15.25L24.9 17.5"
        stroke={`url(#${specular})`}
        strokeWidth="0.85"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
