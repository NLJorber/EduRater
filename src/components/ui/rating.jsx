"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

// A clean star path (24x24)
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

const STAR_COLORS = [
  "#ef4444", // red
  "#f97316", // orange-red
  "#f59e0b", // orange
  "#84cc16", // yellow-green
  "#22c55e", // green
];

function colorForRating(rating) {
  // rating is 0..5 (can be half)
  const idx = clamp(Math.ceil(rating) - 1, 0, 4);
  return STAR_COLORS[idx];
}

export default function Rating({
  value,
  onChange,
  disabled = false,
  className,
  size = "md",
  showValue = false,
  roundToHalf = false,
  valueDisplay = "rounded",
  allowHalfSelect = false,
  colorMode = "perStar",
}) {
  const uid = useId();
  const [hoverValue, setHoverValue] = useState(null);

  const current = Number(value);
  const displayValue = hoverValue ?? (Number.isFinite(current) ? current : 0);
  const fillValue = roundToHalf
    ? Math.round(displayValue * 2) / 2
    : displayValue;
  const exactValue = Number.isFinite(current) ? Math.round(current * 10) / 10 : 0;
  const roundedValue = Number.isFinite(current)
    ? roundToHalf
      ? Math.round(current * 2) / 2
      : Math.round(current * 10) / 10
    : 0;

  const textValue = valueDisplay === "exact" ? exactValue : roundedValue;
  const formattedValue = String(textValue).replace(/\.0$/, "");
  const isInteractive = !disabled && typeof onChange === "function";
  const step = allowHalfSelect ? 0.5 : 1;

  const sizeClass =
    size === "m"
      ? "h-10 w-10"
      : size === "sm"
      ? "h-6 w-6"
      : "h-8 w-8";

  const prevFillValue = useRef(fillValue);
  const [direction, setDirection] = useState("up");

  useEffect(() => {
  setDirection(fillValue >= prevFillValue.current ? "up" : "down");
  prevFillValue.current = fillValue;
  }, [fillValue]);


  const solidColor = colorForRating(fillValue);

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

        const fillColor = colorMode === "solidByRating" ? solidColor : STAR_COLORS[i];

        // Fill fraction for this star (0..1)
        // e.g. rating=3.2 => star 4 gets 0.2
        const fill = clamp(fillValue - i, 0, 1);

        // SVG viewBox width is 24, so we clip with a rect of width 24*fill
        const clipId = `${uid}-star-clip-${i}`;
        const waveDelayMs = (direction === "up" ? i : 4 - i) * 45; // tweak 45 to taste


        const handlePointer = (event) => {
          if (!isInteractive) return;
          if (!allowHalfSelect) {
            onChange(String(starValue));
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const isHalf = offsetX < rect.width / 2;
          const nextValue = isHalf ? starValue - 0.5 : starValue;
          onChange(String(nextValue));
        };

        const handleHover = (event) => {
          if (!isInteractive) return;
          if (!allowHalfSelect) {
            setHoverValue(starValue);
            return;
          }

          const rect = event.currentTarget.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const isHalf = offsetX < rect.width / 2;
          const nextValue = isHalf ? starValue - 0.5 : starValue;
          setHoverValue(nextValue);
        };

        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={isInteractive ? handlePointer : undefined}
            onPointerDown={isInteractive ? handlePointer : undefined}
            onMouseMove={isInteractive ? handleHover : undefined}
            onMouseEnter={isInteractive ? handleHover : undefined}
            onMouseLeave={isInteractive ? () => setHoverValue(null) : undefined}
            className={cn(
              "inline-flex flex-shrink-0 items-center justify-center",
              isInteractive &&
              "cursor-pointer transition-transform duration-150 ease-out hover:scale-110 active:scale-95",
              disabled && isInteractive && "cursor-not-allowed opacity-60",
disabled && !isInteractive && "cursor-default",

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
                  <rect
                    x="0"
                    y="0"
                    width="24"
                    height="24"
                    style={{
                      transformOrigin: "0px 0px",
                      transform: `scaleX(${fill})`,
                      transitionProperty: "transform",
                      transitionDuration: "220ms",
                      transitionTimingFunction: "ease-out",
                      transitionDelay: `${waveDelayMs}ms`,
                    }}
                  />
                </clipPath>
              </defs>

              {/* Base star -outline */}
              <path
                d={STAR_PATH}
                fill="none"
                stroke="#3D2901"
                strokeWidth="0.7"
                strokeLinejoin="round"
              />

              <g clipPath={`url(#${clipId})`}>
                <path d={STAR_PATH} style={{ fill: fillColor, fillOpacity: 1, opacity: 1 }} />
              </g>
            </svg>
          </button>
        );
      })}

      {showValue ? (
        <span className="ml-2 text-sm font-semibold text-brand-brown">
          {formattedValue}
        </span>
      ) : null}
    </div>
  );
}
