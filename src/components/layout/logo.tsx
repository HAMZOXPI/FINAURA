import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND_LOGO_SRC } from "@/lib/brand";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.1),0_1px_2px_rgba(15,23,42,0.06)] sm:h-10 sm:w-10">
        <Image
          src={BRAND_LOGO_SRC}
          alt="Finaura"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 640px) 36px, 40px"
        />
      </span>
      <span
        className={cn(
          "text-xl font-bold leading-none tracking-tight transition-colors duration-300",
          variant === "light" ? "text-white" : "text-surface-900"
        )}
      >
        Finaura
      </span>
    </Link>
  );
}
