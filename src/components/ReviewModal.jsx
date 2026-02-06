"use client";   // makes the component run in the browser

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ReviewModal({ open, review, onClose }) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const sections = Array.isArray(review?.sections) ? review.sections : [];
    const totalSteps = 1 + sections.length; // 0 = main, 1.. = sections

    const isMain = step === 0;
    const activeSection = step > 0 ? sections[step - 1] : null;
    const hasActiveSection = Boolean(activeSection?.section_key);

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 1 }),
        center: { x: "0%", opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 1 }),
    };


    const goPrev = () => {
        setDirection(-1);
        setStep((s) => Math.max(0, s - 1));
    };
    
    const goNext = () => {
        setDirection(1);
        setStep((s) => Math.min(totalSteps - 1, s + 1));
    };

    useEffect(() => {
        if (open) setStep(0); // reset to first step when opening a new review
    }, [open, review?.id]);

    useEffect(() => {
        if (!open) return;
        setStep((s) => Math.min(s, totalSteps - 1));
    }, [open, totalSteps]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
      {/* overlay */}
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* modal panel */}
      <div className="relative z-10 w-[min(720px,92vw)] h-[40vh] min-h-[300px] rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
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

        {/* MAIN SECTION */}
        <div className="mt-4 flex-1 min-h-0">
  <div className="relative h-full overflow-hidden">
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "tween", duration: 0.38, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        {/* the grey scroll box stays fixed size */}
        <div className="h-full overflow-y-auto rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          {step === 0 ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900 dark:text-white">Main Review</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Overall:{" "}
                  {review.rating_computed != null
                    ? `${Number(review.rating_computed).toFixed(1)} / 5`
                    : "—"}
                </p>
              </div>

              {review.body ? (
                <p className="mt-3 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                  {review.body}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No main comment.</p>
              )}
            </>
          ) : hasActiveSection ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {prettySectionName(activeSection.section_key)}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {activeSection.rating ?? "—"} / 5
                </p>
              </div>

              {activeSection.comment ? (
                <p className="mt-3 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
                  {activeSection.comment}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">No comment</p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No category breakdown available for this review.
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</div>



        {/* NAV FOOTER */}
        {totalSteps > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              &lt;
            </button>

            <p className="text-sm text-slate-500 dark:text-slate-300">
              {step + 1} / {totalSteps}
            </p>

            <button
              type="button"
              onClick={goNext}
              disabled={step === totalSteps - 1}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              &gt;
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function prettySectionName(key) {
  const map = {
    teaching: "Teaching",
    safety: "Safety",
    facilities: "Facilities",
    leadership: "Leadership",
  };
  return map[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}