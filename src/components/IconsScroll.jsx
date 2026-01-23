"use client";

import Image from "next/image";

export default function IconsScroll({
  icons = [],
  size = 44,
  rows = 7,
  rowGap = 80,
  speed = 300,
}) {
  if (!icons.length) return null;

  // Strip wide enough to cover the screen and allow for smooth scrolling
  const base = Array.from({ length: 10 }).flatMap(() => icons);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {Array.from({ length: rows }).map((_, rowIndex) => {
        const reverse = rowIndex % 2 === 1;

        return (
          <div
            key={rowIndex}
            className="absolute mt-8 left-0 w-full"
            style={{ top: `${rowIndex * rowGap}px` }}
          >
            <div
              className="icon-track"
              style={{
                animationDuration: `${speed + rowIndex * 1.5}s`,
                animationDirection: reverse ? "reverse" : "normal",
                animationDelay: `${-rowIndex * 2}s`, // desync rows a bit
              }}
            >
              {/* Strip A */}
              <div className="icon-strip">
                {base.map((src, i) => (
                  <Image
                    key={`a-${rowIndex}-${src}-${i}`}
                    src={src}
                    alt=""
                    width={size}
                    height={size}
                    className="select-none"
                  />
                ))}
              </div>

              {/* Strip B (identical) */}
              <div className="icon-strip" aria-hidden="true">
                {base.map((src, i) => (
                  <Image
                    key={`b-${rowIndex}-${src}-${i}`}
                    src={src}
                    alt=""
                    width={size}
                    height={size}
                    className="select-none"
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
