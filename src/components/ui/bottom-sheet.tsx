"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useDragControls, type Transition } from "framer-motion";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

export type BottomSheetHeight = "auto" | "small" | "medium" | "large";

const HEIGHT_CLASS: Record<BottomSheetHeight, string> = {
  auto: "max-h-[min(85vh,calc(100vh-2rem))]",
  small: "max-h-[min(45vh,calc(100vh-2rem))]",
  medium: "max-h-[min(70vh,calc(100vh-2rem))]",
  large: "max-h-[min(92vh,calc(100vh-2rem))]",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;
const SHEET_TRANSITION = { type: "spring", stiffness: 340, damping: 34 } as const;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  height?: BottomSheetHeight;
  showHandle?: boolean;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  zIndex?: number;
  /** Overrides the default open/close spring for this sheet only. All other BottomSheets keep the default. */
  transition?: Transition;
}

/**
 * Premium native-feeling mobile Bottom Sheet (Airbnb / Apple Maps style).
 * Renders via a portal, slides up from the bottom with a soft spring, and can
 * be dismissed by swiping down on the handle, tapping the backdrop, pressing
 * the close button, or pressing Escape. Desktop call sites should keep using
 * their existing dialog/dropdown UI and only mount this on mobile/tablet.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  title,
  description,
  height = "auto",
  showHandle = true,
  showCloseButton = true,
  closeOnBackdrop = true,
  closeLabel = "Close",
  ariaLabel,
  className,
  contentClassName,
  zIndex = 200,
  transition = SHEET_TRANSITION,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  useEffect(() => setMounted(true), []);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  const handleTabTrap = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex }}>
          <motion.button
            type="button"
            aria-label={closeLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 h-full w-full bg-surface-950/50 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? title}
            tabIndex={-1}
            onKeyDown={handleTabTrap}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.65 }}
            onDragEnd={(_event, info) => {
              if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
                onClose();
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={transition}
            style={{ willChange: "transform" }}
            className={cn(
              "absolute inset-x-0 bottom-0 flex w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-12px_48px_-12px_rgba(15,23,42,0.28)] outline-none sm:mx-auto sm:max-w-lg sm:rounded-t-[32px]",
              HEIGHT_CLASS[height],
              className
            )}
          >
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="relative flex shrink-0 touch-none items-center justify-center pb-1 pt-3"
              style={{ cursor: "grab" }}
            >
              {showHandle && (
                <span className="h-1.5 w-10 rounded-full bg-surface-300 shadow-sm" aria-hidden="true" />
              )}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={closeLabel}
                  className="absolute end-3 top-2 flex h-8 w-8 items-center justify-center rounded-full text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {title && (
              <div className="shrink-0 px-5 pb-3">
                <h2 className="text-base font-bold text-surface-900">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-surface-500">{description}</p>
                )}
              </div>
            )}

            <div
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
                contentClassName
              )}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface BottomSheetOptionProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
}

/** Premium tappable row used inside BottomSheets for action lists (Airbnb/Uber style). */
export function BottomSheetOption({
  icon,
  label,
  description,
  onClick,
  href,
  destructive,
  disabled,
  trailing,
}: BottomSheetOptionProps) {
  const rowClassName = cn(
    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-start transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    destructive
      ? "text-red-600 hover:bg-red-50 active:bg-red-100"
      : "text-surface-800 hover:bg-surface-100 active:bg-surface-200"
  );

  const content = (
    <>
      {icon && (
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            destructive ? "bg-red-100 text-red-600" : "bg-surface-100 text-surface-600"
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs font-normal text-surface-500">{description}</span>
        )}
      </span>
      {trailing}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={rowClassName}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={rowClassName}
    >
      {content}
    </motion.button>
  );
}
