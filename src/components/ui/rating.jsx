"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Rating({
  value,
  onChange,
  disabled = false,
  className,
  size = "md",
}) {
  const [hoverValue, setHoverValue] = useState(null);
  const current = Number(value) || 0;
  const displayValue = hoverValue ?? current;

  const sizeClass =
    size === "lg" ? "text-2xl h-10 w-10" : size === "sm" ? "text-lg h-7 w-7" : "text-xl h-8 w-8";

  return (
    <div
      className={cn(
        "inline-flex w-max items-center gap-1 whitespace-nowrap",
        disabled && "opacity-50",
        className
      )}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(String(starValue))}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            className={cn(
              "inline-flex flex-shrink-0 items-center justify-center leading-none",
              sizeClass
            )}
            aria-label={`Rate ${starValue} out of 5`}
            aria-pressed={filled}
          >
            <span
              aria-hidden="true"
              className={cn(
                "leading-none transition-colors",
                filled ? "text-yellow-400" : "text-gray-300"
              )}
            >
              {filled ? "★" : "☆"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
