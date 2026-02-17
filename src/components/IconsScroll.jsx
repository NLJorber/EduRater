"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function IconsScroll({
  size = 220,
  count = 5,
  inset = 60,
  driftPx = 1000,
  driftSeconds = 14,
  wanderPx = 96,
  magnetOffset = { x: 0, y: 0 },
  opacity = 0.9,

  // Brand colors
  colors = ["var(--color-brand-orange)", "var(--color-brand-brown)"],

  // Blob shapes
  blobs = [
    "58% 42% 63% 37% / 46% 58% 42% 54%",
    "78% 22% 22% 78% / 30% 80% 20% 70%",
    "62% 38% 54% 46% / 40% 62% 38% 60%",
    "82% 18% 36% 64% / 26% 78% 38% 74%",
    "55% 45% 38% 62% / 50% 60% 40% 50%",

  ],
}) {
  const oddCount = useMemo(() => {
    const n = Math.max(1, Math.floor(count));
    return n % 2 === 1 ? n : n - 1;
  }, [count]);

  const seedRef = useRef(Math.random() * 1e9);
  const rand = useMemo(() => mulberry32(seedRef.current), []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = useMemo(() => {
    const corners = [
      { id: "tl", x: 0, y: 0, vx: 1, vy: 1 },
      { id: "tr", x: 1, y: 0, vx: -1, vy: 1 },
      { id: "br", x: 1, y: 1, vx: -1, vy: -1 },
      { id: "bl", x: 0, y: 1, vx: 1, vy: -1 },
    ];

    const cornerStart = Math.floor(rand() * 4);

    let anchors = [];
    if (oddCount === 3) {
      anchors = [0, 1, 2].map((k) => corners[(cornerStart + k) % 4]);
    } else if (oddCount >= 5) {
      anchors = corners.slice();
      const extraCorner = corners[(cornerStart + 1) % 4];
      anchors.push({ ...extraCorner, id: extraCorner.id + "-extra", extra: true });

      for (let i = 5; i < oddCount; i++) {
        const c = corners[(cornerStart + i) % 4];
        anchors.push({ ...c, id: c.id + "-extra-" + i, extra: true });
      }
    } else {
      anchors = [corners[cornerStart]];
    }

    return anchors.map((a, i) => {
      const intoX = a.vx * (driftPx * (0.7 + rand() * 0.6));
      const intoY = a.vy * (driftPx * (0.7 + rand() * 0.6));

      const tanX = -a.vy * (wanderPx * (0.8 + rand() * 1.2));
      const tanY = a.vx * (wanderPx * (0.8 + rand() * 1.2));

      const dur = driftSeconds * (0.85 + rand() * 0.6);
      const dur2 = driftSeconds * 0.55 * (0.9 + rand() * 0.7);
      const delay = -(rand() * dur);

      const blobRadius = blobs[i % blobs.length];
      const scale = 0.92 + rand() * 0.18;
      const rot = (rand() < 0.5 ? -1 : 1) * (2 + rand() * 6);

      const fill = colors[i % colors.length];
      const extraShift = a.extra ? 0.16 + rand() * 0.2 : 0;

      return {
        key: `${a.id}-${i}`,
        ax: a.x,
        ay: a.y,
        cornerId: a.id,
        extraShift,
        dx: intoX + tanX,
        dy: intoY + tanY,
        dx2: tanX,
        dy2: tanY,
        dur,
        dur2,
        delay,
        rot,
        scale,
        blobRadius,
        fill,
      };
    });
  }, [rand, oddCount, driftPx, driftSeconds, wanderPx, blobs, colors]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity, "--blobSize": `clamp(280px, 36vw, ${size}px)`, }}>
      <style jsx global>{`
        .corner-field {
          position: absolute;
          inset: 0;
          transform: translate3d(${magnetOffset.x}px, ${magnetOffset.y}px, 0);
          will-change: transform;
        }

        .corner-blob {
          position: absolute;
          width: var(--blobSize);
          height: var(--blobSize);
          border-radius: var(--blobRadius);
          background: var(--fill);
          opacity: 1;

          transform: translate(-50%, -50%);
          will-change: transform;
          animation: driftMain calc(var(--dur) * 1s) ease-in-out infinite alternate,
            driftSub calc(var(--dur2) * 1s) ease-in-out infinite alternate;
          animation-delay: calc(var(--delay) * 1s), calc(var(--delay) * 1s);
        }

        @keyframes driftMain {
          from {
            transform: translate(-50%, -50%) translate3d(0, 0, 0)
              rotate(calc(var(--rot) * 1deg)) scale(var(--scale));
          }
          to {
            transform: translate(-50%, -50%)
              translate3d(calc(var(--dx) * 1px), calc(var(--dy) * 1px), 0)
              rotate(calc(var(--rot) * 1deg)) scale(var(--scale));
          }
        }

        @keyframes driftSub {
          from {
            transform: translate(-50%, -50%)
              translate3d(calc(var(--dx2) * -1px), calc(var(--dy2) * 1px), 0)
              rotate(calc(var(--rot) * 1deg)) scale(var(--scale));
          }
          to {
            transform: translate(-50%, -50%)
              translate3d(calc(var(--dx2) * 1px), calc(var(--dy2) * -1px), 0)
              rotate(calc(var(--rot) * 1deg)) scale(var(--scale));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .corner-blob {
            animation: none !important;
          }
        }
      `}</style>

      <div className="corner-field">
        {mounted &&
          items.map((it) => {
            const half = size / 2;

            const baseLeft =
              it.ax === 0 ? `${inset + half}px` : `calc(100% - ${inset + half}px)`;
            const baseTop =
              it.ay === 0 ? `${inset + half}px` : `calc(100% - ${inset + half}px)`;

            let left = baseLeft;
            let top = baseTop;

            if (it.extraShift) {
              const shift = `${it.extraShift * 100}%`;
              left =
                it.ax === 0
                  ? `calc(${inset + half}px + ${shift})`
                  : `calc(100% - ${inset + half}px - ${shift})`;

              top =
                it.ay === 0
                  ? `${inset + half + Math.round(half * 0.18)}px`
                  : `calc(100% - ${inset + half + Math.round(half * 0.18)}px)`;
            }

            return (
              <div
                key={it.key}
                className="corner-blob"
                style={{
                  left,
                  top,
                  "--dx": it.dx,
                  "--dy": it.dy,
                  "--dx2": it.dx2,
                  "--dy2": it.dy2,
                  "--dur": it.dur,
                  "--dur2": it.dur2,
                  "--delay": it.delay,
                  "--rot": it.rot,
                  "--scale": it.scale,
                  "--blobRadius": it.blobRadius,
                  "--fill": it.fill,
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
