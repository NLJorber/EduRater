"use client";

import { useRef, useState } from "react";

function SpotlightCard({ children, className = "", spotlightColor = "rgba(255, 255, 255, 0.25)" }) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setOpacity(0.6)}
            onMouseLeave={() => setOpacity(0)}
            className={`relative overflow-hidden ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
                }}
            />
            {children}
        </div>
    );
}

/* school and num are passed as props containing the schools data and its index */
export default function SchoolCard({ school, score }) {
    if (!school) return null; /* prevent rendering if no school data is provided */

    const logoUrl = school.logo_url;
    const initial = (school.EstablishmentName || "?").trim().charAt(0).toUpperCase();
    const phase = school["PhaseOfEducation (name)"] || "School";
    const town = school.Town || "Unknown town";
    const postcode = school.Postcode || "Unknown postcode";
    const scoreLabel = score === null ? "No score yet" : `${score.toFixed(1)} / 5`;

    return (
        <SpotlightCard
            className="display-headings group h-full w-full rounded-2xl border border-brand-brown/80 dark:border-brand-blue bg-gradient-to-b from-brand-blue via-brand-blue to-[#0f5fd1] dark:from-brand-cream dark:via-brand-cream dark:to-[#efe3bf] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
            spotlightColor="rgba(255, 255, 255, 0.26)"
        >
            <div className="flex h-full flex-col">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full border border-brand-cream/50 bg-brand-cream/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-cream dark:border-brand-blue/30 dark:bg-brand-blue/10 dark:text-brand-blue">
                        {phase}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-brand-cream px-3 py-1 text-xs font-bold text-brand-blue dark:bg-brand-blue dark:text-brand-cream">
                        {scoreLabel}
                    </span>
                </div>

                <div className="rounded-xl border border-brand-cream/25 bg-brand-cream/10 p-4 dark:border-brand-blue/25 dark:bg-brand-blue/5">
                    <div className="flex items-start gap-3">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={`${school.EstablishmentName} logo`}
                                className="h-12 w-12 rounded-full bg-white p-1 object-contain ring-2 ring-brand-cream/40 dark:ring-brand-blue/30"
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-lg font-semibold text-brand-blue ring-2 ring-brand-cream/40 dark:bg-brand-blue dark:text-brand-cream dark:ring-brand-blue/30">
                                {initial}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="line-clamp-2 text-lg font-extrabold leading-tight text-brand-cream dark:text-brand-blue">
                                {school.EstablishmentName}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-brand-cream/85 dark:text-brand-brown">
                                {town}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-4 text-sm text-brand-cream dark:text-brand-brown">
                    <p className="font-medium">
                        Location: <span className="font-semibold">{postcode}</span>
                    </p>
                </div>
            </div>
        </SpotlightCard>
    );
}
