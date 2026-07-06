import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
}

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-surface-900 text-white hover:bg-surface-800 shadow-sm",
  outline: "border border-surface-300 bg-white text-surface-700 hover:bg-surface-50",
  ghost: "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

const baseClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", isLoading, disabled, href, children, ...props },
    ref
  ) => {
    const classes = cn(baseClassName, variants[variant], sizes[size], className);

    const content = isLoading ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </>
    ) : (
      children
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} disabled={disabled || isLoading} className={classes} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
