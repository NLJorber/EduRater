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

  // Load edit data
  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title ?? "");
    setBody(initialData.body ?? "");

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
            typeof existing.rating === "number" ? String(existing.rating) : "",
          comment: existing.comment ?? "",
          isNa,
        };
      })
    );
  }, [initialData]);

  // Computed overall (display only)
  const computedOverall = useMemo(() => {
    const nums = sections
      .filter((s) => !s.isNa && s.rating !== "")
      .map((s) => Number(s.rating))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);

    if (nums.length === 0) return null;

    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return Math.round(avg * 10) / 10; // display exact to 1 decimal
  }, [sections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: isEditing ? "Saving..." : "Posting..." });

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

    if (!cleanBody) {
      setStatus({ type: "error", message: "Review body cannot be empty." });
      return;
    }

    // Build sections payload (only include sections that have anything)
    const payloadSections = sections
      .filter((s) => s.rating !== "" || s.comment.trim() || s.isNa)
      .map((s) => ({
        sectionKey: s.key,
        rating: s.isNa || s.rating === "" ? null : Number(s.rating),
        comment: s.comment.trim() || null,
      }));

    // Enforce your rules:
    // 1) at least one section star rating
    const hasAtLeastOneSectionRating = payloadSections.some(
      (s) => typeof s.rating === "number" && s.rating >= 1 && s.rating <= 5
    );

    if (!hasAtLeastOneSectionRating) {
      setStatus({ type: "error", message: "Please rate at least one section." });
      return;
    }

    // 2) at least one section comment (you said “ideally” — you asked to enforce it)
    const hasAtLeastOneSectionComment = payloadSections.some(
      (s) => typeof s.comment === "string" && s.comment.trim().length > 0
    );

    if (!hasAtLeastOneSectionComment) {
      setStatus({
        type: "error",
        message: "Please write a comment in at least one section.",
      });
      return;
    }

    const res = await fetch(isEditing ? `/api/reviews/${reviewId}` : "/api/reviews", {
      method: isEditing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(
        isEditing
          ? {
              title: cleanTitle || null,
              body: cleanBody,
              sections: payloadSections,
            }
          : {
              schoolUrn: Number(schoolUrn),
              title: cleanTitle || null,
              body: cleanBody,
              sections: payloadSections,
            }
      ),
    });

    const bodyResponse = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({
        type: "error",
        message: bodyResponse.error || "Failed to post review.",
      });
      return;
    }

    // Reset form after creating (not editing)
    if (!isEditing) {
      setTitle("");
      setBody("");
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
      message: isEditing ? "Review updated successfully!" : "Review posted successfully!",
    });

    onPosted?.();
  };

  return (
    <div className="my-6 pl-16 pr-16 mt-0 rounded-lg border border-brand-brown bg-brand-blue p-4 dark:border-brand-blue dark:bg-brand-blue">
      <h3 className="mt-5 font-semibold text-brand-cream dark:text-brand-cream">
        {isEditing ? "Edit your review" : "Leave a review"}
      </h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-brand-cream dark:text-brand-cream">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="mt-1 w-full rounded-md border border-brand-cream px-3 py-2 dark:border-brand-cream placeholder:text-brand-brown/30  dark:placeholder:text-brand-brown/30 dark:bg-brand-cream text-brand-brown dark:text-brand-brown"
            placeholder="Optional title"
          />
        </div>

        <div>
          <label className="block text-sm mt-4 font-medium text-brand-cream dark:text-brand-cream">
            Overall Rating (computed)
          </label>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Rating
              value={computedOverall != null ? String(computedOverall) : ""}
              disabled
              roundToHalf
            />
            {/* <span className="text-sm font-bold  text-brand-cream dark:text-brand-orange">
              {computedOverall != null
                ? `${computedOverall} / 5`
                : "*Rate the sections to see an overall score"}
            </span> */}
          </div>
          <p className="mt-4 text-xs font-semibold text-brand-cream dark:text-brand-orange">
            *Pick ratings below to calculate your overall score.
          </p>

          {computedOverall != null ? (
            <p className="mt-2 text-xs text-brand-cream dark:text-brand-cream">
              Computed from section ratings:{" "}
              <span className="font-semibold">{computedOverall} / 5</span>
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-cream dark:text-brand-cream">
            Review
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-md border border-brand-cream px-3 py-2 dark:border-brand-cream dark:bg-brand-cream dark:text-brand-cream placeholder:text-brand-brown/30"
            rows={5}
            maxLength={2000}
            placeholder="Write your review here..."
            required
          />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-brand-cream dark:text-brand-cream">
            Section ratings
          </h4>

          <div className="mt-3 space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.key}
                className="rounded-md border border-brand-cream p-3 dark:border-brand-cream"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-brand-cream dark:text-brand-cream">
                    {section.label}
                  </p>

                  {index === sendSectionIndex && (
                    <button
                      type="button"
                      onClick={() =>
                        setSections((prev) =>
                          prev.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, isNa: !item.isNa, rating: "", comment: "" }
                              : item
                          )
                        )
                      }
                      className="text-xs font-semibold text-brand-cream hover:text-brand-cream"
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
                      allowHalfSelect
                      colorMode="perStar"
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
                    <p className="mt-1 text-xs text-brand-cream dark:text-brand-cream">
                      {section.isNa
                        ? "Marked N/A"
                        : section.rating
                        ? `${section.rating} / 5`
                        : "Select a rating"}
                    </p>
                  </div>

                  <textarea
                    value={section.comment}
                    maxLength={1000}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, comment: e.target.value, isNa: false }
                            : item
                        )
                      )
                    }
                    className="w-full rounded-md border border-brand-cream px-3 py-2 text-sm dark:border-brand-cream dark:bg-brand-cream text-brand-cream dark:text-brand-brown placeholder:text-brand-cream/70" 
                    rows={3}
                    placeholder="Write a comment (at least one section comment required)"
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
          className="rounded-md bg-brand-brown px-4 py-2 font-semibold text-brand-cream hover:bg-brand-orange disabled:opacity-60"
        >
          {isEditing ? "Save changes" : "Post"}
        </button>

        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="ml-3 rounded-md border border-brand-cream px-4 py-2 font-semibold text-brand-cream hover:bg-brand-cream dark:border-brand-cream dark:text-brand-cream dark:hover:bg-brand-cream"
          >
            Cancel
          </button>
        ) : null}

        {status.type !== "idle" && (
          <p
            className={`text-sm ${
              status.type === "error"
                ? "text-brand-orange"
                : "text-brand-orange dark:text-brand-orange"
            }`}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
