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
        className="absolute inset-0 bg-brand-black/80"
        onClick={onClose}
      />

      {/* modal panel */}
      <div className="relative z-10 w-[min(720px,92vw)] h-[40vh] min-h-[300px] rounded-2xl border border-4 border-brand-blue bg-brand-cream dark:bg-brand-blue dark:border-brand-cream p-6 shadow-xl flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className=" font-semibold text-brand-brown dark:text-brand-cream">
              {review.title || "Review"}
            </h4>
            <p className="text-sm text-brand-brown dark:text-brand-cream">
              {new Date(review.created_at).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-brown hover:text-brand-cream hover:bg-brand-orange dark:text-brand-cream dark:hover:bg-brand-brown"
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
        <div className="h-full overflow-y-auto rounded-xl border border-brand-blue p-4 dark:border-brand-cream dark:bg-brand-brown bg-brand-blue ">
          {step === 0 ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-brand-cream">Main Review</p>
                <p className="text-sm font-semibold text-brand-cream">
                  Overall:{" "}
                  {review.rating_computed != null
                    ? `${Number(review.rating_computed).toFixed(1)} / 5`
                    : "—"}
                </p>
              </div>

              {review.body ? (
                <p className="mt-3 whitespace-pre-wrap text-brand-cream">
                  {review.body}
                </p>
              ) : (
                <p className="mt-3 text-sm text-brand-cream">No main comment.</p>
              )}
            </>
          ) : hasActiveSection ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-brand-cream">
                  {prettySectionName(activeSection.section_key)}
                </p>
                <p className="text-sm font-semibold text-brand-cream">
                  {activeSection.rating ?? "—"} / 5
                </p>
              </div>

              {activeSection.comment ? (
                <p className="mt-3 whitespace-pre-wrap text-brand-cream">
                  {activeSection.comment}
                </p>
              ) : (
                <p className="mt-2 text-sm text-brand-cream">No comment</p>
              )}
            </>
          ) : (
            <p className="text-sm text-brand-brown dark:text-brand-cream">
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
              className="rounded-full border border-2 border-brand-brown px-4 py-2 text-sm font-semibold text-brand-brown disabled:opacity-40 dark:border-brand-cream dark:text-brand-cream dark:bg-brand-brown hover:bg-brand-orange dark:hover:border-brand-brown dark:hover:text-brand-brown"
            >
              &lt;
            </button>

            <p className="text-sm text-brand-brown dark:text-brand-cream">
              {step + 1} / {totalSteps}
            </p>

            <button
              type="button"
              onClick={goNext}
              disabled={step === totalSteps - 1}
              className="rounded-full border border-2 border-brand-brown px-4 py-2 text-sm font-semibold text-brand-brown disabled:opacity-40 dark:border-brand-cream dark:text-brand-cream dark:bg-brand-brown hover:bg-brand-orange dark:hover:border-brand-brown dark:hover:text-brand-brown"
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