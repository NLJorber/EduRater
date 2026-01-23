"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import Rating from "@/components/ui/rating";

const SECTION_DEFS = [
    { key: "teaching_learning", label: "Teaching & Learning" },
    { key: "pastoral_safeguarding", label: "Pastoral Care & Safeguarding" },
    { key: "parent_communication", label: "Parent Communication" },
    { key: "send_support", label: "SEND Support" },
    { key: "facilities_resources", label: "Facilities & Resources" },
    { key: "behaviour_culture", label: "Behaviour & Culture" },
    { key: "extra_curricular", label: "Extra-Curricular & Enrichment" },
];

export default function ReviewForm({
    schoolUrn,
    onPosted,
    reviewId,
    initialData,
    onCancel,
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [rating, setRating] = useState("");
    const [ratingManuallySet, setRatingManuallySet] = useState(false);

    const [status, setStatus] = useState({ type: "idle", message: "" });

    const [sections, setSections] = useState(() =>
        SECTION_DEFS.map((section) => ({
            ...section,
            rating: "",
            comment: "",
            isNa: false,
        }))
    );

    const sendSectionIndex = useMemo(
        () => sections.findIndex((section) => section.key === "send_support"),
        [sections]
    );

    const isEditing = Boolean(reviewId);

    useEffect(() => {
        if (!initialData) return;

        setTitle(initialData.title ?? "");
        setBody(initialData.body ?? "");
        setRating(
            typeof initialData.rating === "number" ? String(initialData.rating) : ""
        );

        const sectionMap = new Map(
            (initialData.review_sections || []).map((section) => [
                section.section_key,
                section,
            ])
        );

        setSections(
            SECTION_DEFS.map((section) => {
                const existing = sectionMap.get(section.key);
                if (!existing) {
                    return { ...section, rating: "", comment: "", isNa: false };
                }

                const isNa =
                    section.key === "send_support" &&
                    existing.rating === null &&
                    (existing.comment === null || existing.comment === "");

                return {
                    ...section,
                    rating:
                        typeof existing.rating === "number"
                            ? String(existing.rating)
                            : "",
                    comment: existing.comment ?? "",
                    isNa,
                };
            })
        );
    }, [initialData]);

    const computedOverall = useMemo(() => {
    const nums = sections
        .filter((s) => !s.isNa && s.rating !== "")
        .map((s) => Number(s.rating))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);

    if (nums.length === 0) return null;

    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.round(avg * 10) / 10; // 1 decimal
}, [sections]);

    useEffect(() => {
    if (!ratingManuallySet && computedOverall != null) {
      setRating(String(computedOverall));
    }
  }, [computedOverall, ratingManuallySet]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Posting review..." });

    const { data, error: sessionErr } = await supabaseClient.auth.getSession();

    if (sessionErr || !data?.session) {
      setStatus({
        type: "error",
        message: "You must be logged in to post a review.",
      });
      return;
    }

            const cleanTitle = title.trim();
            const cleanBody = body.trim();
            const numRating = Number(rating);

    if (!cleanBody) {
      setStatus({ type: "error", message: "Review body cannot be empty." });
      return;
    }

    if (!Number.isFinite(numRating) || numRating < 0 || numRating > 5) {
      setStatus({
        type: "error",
        message: "Rating must be a number between 0 and 5.",
      });
      return;
    }

    const payloadSections = sections
      .filter((section) => section.rating !== "" || section.comment || section.isNa)
      .map((section) => ({
        sectionKey: section.key,
        rating: section.isNa || section.rating === "" ? null : Number(section.rating),
        comment: section.comment.trim() || null,
      }));

const res = await fetch(isEditing ? `/api/reviews/${reviewId}` : "/api/reviews", {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
body: JSON.stringify({
        ...(isEditing
          ? {
              title: cleanTitle || null,
              body: cleanBody,
              rating: numRating,
              sections: payloadSections,
            }
          : {
              schoolUrn: Number(schoolUrn),
              title: cleanTitle || null,
              body: cleanBody,
              rating: numRating,
              sections: payloadSections,
            }),
      }),
    });

const bodyResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({
        type: "error",
        message: bodyResponse.error || "Failed to post review.",
      });
      return;
    }

 if (!isEditing) {
      setTitle("");
      setBody("");
      setRating("");
      setRatingManuallySet(false);
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          rating: "",
          comment: "",
          isNa: false,
        }))
      );
    }

    setStatus({
      type: "info",
      message: isEditing
        ? "Review updated successfully!"
        : "Review posted successfully!",
    });

    onPosted?.();
  };

    return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-brand-brown dark:text-brand-cream">
        {isEditing ? "Edit your review" : "Leave a review"}
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
            placeholder="Optional title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Overall Rating
          </label>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Rating
              value={rating}
              onChange={(val) => {
                setRatingManuallySet(true);
                setRating(val);
              }}
            />

            <span className="text-sm text-gray-600 dark:text-gray-300">
              {rating ? `${rating} / 5` : "Select a rating"}
            </span>
          </div>

          {computedOverall != null ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Computed from section ratings:{" "}
              <span className="font-semibold">{computedOverall} / 5</span>
              {!ratingManuallySet ? " (auto-filled)" : ""}
            </p>
          ) : null}

          {/* Optional: if you want users to type decimals, uncomment this.
              If you do, consider also adding half-star UI later. */}
          {/* 
          <input
            value={rating}
            onChange={(e) => {
              setRatingManuallySet(true);
              setRating(e.target.value);
            }}
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
            required
          /> 
          */}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Review
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
            rows={5}
            placeholder="Write your review here..."
            required
          />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Section ratings (optional)
          </h4>

          <div className="mt-3 space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.key}
                className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {section.label}
                  </p>

                  {index === sendSectionIndex && (
                    <button
                      type="button"
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  isNa: !item.isNa,
                                  rating: "",
                                  comment: "",
                                }
                              : item
                          )
                        )
                      }
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {section.isNa ? "Undo N/A" : "Mark as N/A"}
                    </button>
                  )}
                </div>

                <div className="mt-2 grid gap-3">
                  <div>
                    <Rating
                      value={section.rating}
                      disabled={section.isNa}
                      size="sm"
                      onChange={(val) =>
                        setSections((prev) =>
                          prev.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, rating: val, isNa: false }
                              : item
                          )
                        )
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {section.isNa
                        ? "Marked N/A"
                        : section.rating
                        ? `${section.rating} / 5`
                        : "Optional"}
                    </p>
                  </div>

                  <textarea
                    value={section.comment}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, comment: e.target.value, isNa: false }
                            : item
                        )
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-black dark:text-white"
                    rows={3}
                    placeholder="Optional comment"
                    disabled={section.isNa}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isEditing ? "Save changes" : "Post"}
        </button>

        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="ml-3 rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        ) : null}

         {status.type !== "idle" && (
          <p
            className={`text-sm ${
              status.type === "error"
                ? "text-red-600"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}















    
