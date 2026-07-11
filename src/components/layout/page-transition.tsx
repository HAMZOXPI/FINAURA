"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const slideVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

// Property detail pages host a shared-element (layoutId) photo/title morph
// that already owns its own position/size animation. Sliding the whole page
// on top of that would fight the morph (the hero would move diagonally
// instead of growing cleanly in place), so those routes only fade.
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const PROPERTY_DETAIL_PATTERN = /^\/properties\/[^/]+\/?$/;

/**
 * Wraps routed content so navigating between pages feels like a native
 * mobile transition (slide + fade) instead of an abrupt swap. Keyed on the
 * pathname only (not search params), so filter/sort/pagination changes on
 * the same route never replay the transition — only real route changes do.
 *
 * `mode="popLayout"` removes the exiting page from layout flow immediately,
 * so the entering page never has to wait for it and no layout shift/white
 * gap appears between the two. Uses GPU-friendly `transform`/`opacity` only.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const variants = PROPERTY_DETAIL_PATTERN.test(pathname) ? fadeVariants : slideVariants;

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
