"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Global Framer Motion configuration.
 *
 * `reducedMotion="user"` makes every motion/layout/shared-element animation
 * in the app automatically respect the OS-level `prefers-reduced-motion`
 * setting: transforms/layout animations jump straight to their end state,
 * while opacity transitions are kept — giving reduced-motion users a simple
 * fade instead of slides, scales or shared-element morphs, with zero extra
 * per-component logic.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
