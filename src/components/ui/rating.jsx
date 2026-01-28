"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// A clean star path (24x24)
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

export default function Rating({
  value,
  onChange,
  disabled = false,
  className,
  size = "md",
}) {
  const uid = useId();
  const [hoverValue, setHoverValue] = useState(null);

  const current = Number(value);
  const displayValue = hoverValue ?? (Number.isFinite(current) ? current : 0);

  const sizeClass =
    size === "m"
      ? "h-10 w-10"
      : size === "sm"
      ? "h-6 w-6"
      : "h-8 w-8";

  return (
    <div
      className={cn(
        "inline-flex w-max items-center gap-1 whitespace-nowrap",
        className
      )}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;

        // Fill fraction for this star (0..1)
        // e.g. rating=3.2 => star 4 gets 0.2
        const fill = clamp(displayValue - i, 0, 1);

        // SVG viewBox width is 24, so we clip with a rect of width 24*fill
        const clipId = `${uid}-star-clip-${i}`;
        const clipWidth = 24 * fill;

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(String(starValue))}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            className={cn(
              "inline-flex flex-shrink-0 items-center justify-center",
              sizeClass
            )}
            aria-label={`Rate ${starValue} out of 5`}
            aria-pressed={fill === 1}
          >
            <svg
              viewBox="0 0 24 24"
              className={cn("block", sizeClass)}
              aria-hidden="true"
            >
              <defs>
                <clipPath id={clipId}>
                  <rect x="0" y="0" width={clipWidth} height="24" />
                </clipPath>
              </defs>

              {/* Base star (empty/gray) */}
              <path d={STAR_PATH} fill="currentColor" className="text-gray-300" />

              {/* Filled portion (yellow), clipped */}
              <g clipPath={`url(#${clipId})`}>
                <path
                  d={STAR_PATH}
                  fill="currentColor"
                  className="text-brand-orange"
                />
              </g>
            </svg>
          </button>
        );
      })}
    </div>
  );
}
