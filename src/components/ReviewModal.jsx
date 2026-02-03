"use client";   // makes the component run in the browser

import { useEffect } from "react";

export default function ReviewModal({ open, review, onClose }) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
            };

            window.addEventListener("keydown", onKeyDown);

            // lock background scroll
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open || !review) return null;

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        aria-modal="true"
        role="dialog"
        >
            {/* overlay */}
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* modal panel */}
            <div className="relative z-10 w-[min(720px,92vw)] max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {review.title || "Review"}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                    {new Date(review.created_at).toLocaleString()}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
                >
                    ✕
                </button>
                </div>

                {/* main body */}
                {review.body ? (
                <p className="mt-4 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                    {review.body}
                </p>
                ) : null}

                {/* sections (category ratings/comments) */}
                {Array.isArray(review.sections) && review.sections.length > 0 ? (
                <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    Category ratings
                    </h4>

                    {review.sections.map((s) => (
                    <div
                        key={s.section_key}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {prettySectionName(s.section_key)}
                        </p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {s.rating ?? "—"} / 5
                        </p>
                        </div>

                        {s.comment ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                            {s.comment}
                        </p>
                        ) : (
                        <p className="mt-2 text-sm text-slate-400">No comment</p>
                        )}
                    </div>
                    ))}
                </div>
                ) : (
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-300">
                    No category breakdown available for this review.
                </p>
                )}
            </div>
        </div>
    );
    }

    function prettySectionName(key) {
    // tweak to match your section keys
    const map = {
        teaching: "Teaching",
        safety: "Safety",
        facilities: "Facilities",
        leadership: "Leadership",
        // ...
    };

    return map[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}