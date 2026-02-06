"use client";

import { useEffect } from "react";

export default function Modal({ open, onClose, title, children }) {
  // Close on Escape + prevent background scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 pt-6"
      aria-modal="true"
      role="dialog"
      onMouseDown={(e) => {
        // click on backdrop closes
        if (e.target === e.currentTarget) onClose?.();
      }}
    >


      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />

      {/* Panel */}
      <div className="relative mx-auto mt-24 w-[min(92vw,720px)] max-h-[80vh] overflow-hidden rounded-lg bg-brand-cream dark:bg-brand-brown p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-brand-orange font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 bg-brand-brown dark:bg-brand-blue text-brand-cream dark:text-brand-cream hover:bg-brand-orange dark:hover:bg-brand-orange"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 mt-5 max-h-[65vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
