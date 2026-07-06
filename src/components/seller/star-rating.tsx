import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRating({ rating, max = 5, size = "md", className }: StarRatingProps) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of ${max}`}>
      {Array.from({ length: max }).map((_, index) => {
        const filled = rating >= index + 1;
        const partial = !filled && rating > index && rating < index + 1;

        return (
          <Star
            key={index}
            className={cn(
              sizeMap[size],
              filled
                ? "fill-amber-400 text-amber-400"
                : partial
                  ? "fill-amber-200 text-amber-400"
                  : "fill-surface-200 text-surface-300"
            )}
          />
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function StarRatingInput({ value, onChange, label }: StarRatingInputProps) {
  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-surface-700">{label}</p>}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange(starValue)}
              className="rounded p-0.5 transition-transform hover:scale-110"
              aria-label={`${starValue} stars`}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  value >= starValue
                    ? "fill-amber-400 text-amber-400"
                    : "fill-surface-200 text-surface-300"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
