"use client";

import { useEffect, useRef, useState } from "react";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import ReportForm from "@/components/ReportForm";
import ReviewModal from "@/components/ReviewModal";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";
import Link from "next/link";

/* schoolUrn: URN of the school to load reviews for
    refreshKey: when this changes, reviews are reloaded */
export default function ReviewsRow({
  mode = "school",          // "school" | "recent"
  schoolUrn,
  limit = 10,               // only used for mode="recent"
  helpfulThreshold = 2,
  refreshKey,
  headerRight = null,
  cardVariant = "default",
  showTitle = true,
  sectionClassName = "",
  enableHoverScroll = false,
}) {
    const [reviews, setReviews] = useState([]);
    const [schoolScore, setSchoolScore] = useState(null);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [editingReview, setEditingReview] = useState(null);
    const [reportingReview, setReportingReview] = useState(null);
    const [localRefresh, setLocalRefresh] = useState(0);
    const { profile } = useAuthProfile();
    const [isAdmin, setIsAdmin] = useState(false);
    const canReport = Boolean(accessToken);
    const [selectedReview, setSelectedReview] = useState(null);
    const [randomSeed, setRandomSeed] = useState("");

    const scrollerRef = useRef(null);
    const hoverScrollRef = useRef(null);
    
    const [showArrows, setShowArrows] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

   const updateArrowState = () => {
  const el = scrollerRef.current;
  if (!el) return;

  const overflow = el.scrollWidth - el.clientWidth;
  const hasOverflow = overflow > 2; // tolerate rounding

  const left = Math.round(el.scrollLeft);
  const maxLeft = Math.round(overflow);

  setShowArrows(hasOverflow);

  // tolerate fractional scrollLeft + momentum scrolling
  setCanScrollLeft(left > 2);
  setCanScrollRight(left < maxLeft - 2);
};

        

const scrollByCards = (dir) => {
  const el = scrollerRef.current;
  if (!el) return;

  const amount = Math.min(520, el.clientWidth * 0.8) * dir;
  const maxLeft = el.scrollWidth - el.clientWidth;
  const next = Math.max(0, Math.min(maxLeft, el.scrollLeft + amount));

  el.scrollTo({ left: next, behavior: "smooth" });

  requestAnimationFrame(updateArrowState);
  setTimeout(updateArrowState, 150);
  setTimeout(updateArrowState, 450);
};

const hoverScrollEnabled = cardVariant === "home" || enableHoverScroll;

const startHoverScroll = (dir) => {
  if (!hoverScrollEnabled) return;
  if (hoverScrollRef.current) return;

  hoverScrollRef.current = setInterval(() => {
    scrollerRef.current?.scrollBy({ left: dir * 6, behavior: "auto" });
  }, 16);
};

const stopHoverScroll = () => {
  if (!hoverScrollEnabled) return;

  if (hoverScrollRef.current) {
    clearInterval(hoverScrollRef.current);
    hoverScrollRef.current = null;
  }
};

useEffect(() => {
  return () => {
    if (hoverScrollRef.current) {
      clearInterval(hoverScrollRef.current);
      hoverScrollRef.current = null;
    }
  };
}, []);
    
    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabaseClient.auth.getSession();
            setCurrentUserId(data?.session?.user?.id ?? null);
            setAccessToken(data?.session?.access_token ?? "");
        };

        loadSession();

        const { data: sub } = supabaseClient.auth.onAuthStateChange(
            (_event, session) => {
                setCurrentUserId(session?.user?.id ?? null);
                setAccessToken(session?.access_token ?? "");
            }
        );

        return () => sub.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!randomSeed) {
            setRandomSeed(`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        }
    }, [randomSeed]);

    useEffect(() => {
  const el = scrollerRef.current;
  if (!el) return;

  // Initial calculation (after reviews render)
  updateArrowState();

  // Update on scroll
  const onScroll = () => updateArrowState();
  el.addEventListener("scroll", onScroll, { passive: true });

  // Update on resize (container width changes)
  const ro = new ResizeObserver(() => updateArrowState());
  ro.observe(el);

  return () => {
    el.removeEventListener("scroll", onScroll);
    ro.disconnect();
  };
}, [reviews, cardVariant]);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!accessToken) {
                setIsAdmin(false);
                return;
            }

            const res = await fetch("/api/admin/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsAdmin(res.ok);
        };

        checkAdmin();
    }, [accessToken]);

    useEffect(() => {
        const load = async () => {
            if (mode === "school" && !schoolUrn) return;

            setLoading(true);
            setError("");

            const url =
                mode === "recent"
                    ? `/api/reviews?sort=helpful&limit=${encodeURIComponent(limit)}&helpfulThreshold=${encodeURIComponent(helpfulThreshold)}&randomSeed=${encodeURIComponent(randomSeed)}`
                    : `/api/reviews?school_urn=${encodeURIComponent(schoolUrn)}`;

                    
            
            const res = await fetch(url);
            const body = await res.json();

            if (!res.ok) {
                setError(body.error || "Failed to load reviews.");
                setReviews([]);
                setSchoolScore(null);
                setReviewCount(0);
                setLoading(false);
                return;
            }

            if (mode === "recent") {
                // Recent mode: no school score; reviewCount is just number returned (or API can provide it)
                const list = body.data?.reviews || body.data || [];
                setReviews(list);
                setSchoolScore(null);
                setReviewCount(body.data?.reviewCount ?? list.length);
                } else {
                // School mode: keep existing behavior
                setReviews(body.data?.reviews || []);
                setSchoolScore(body.data?.schoolScore ?? null);
                setReviewCount(body.data?.reviewCount ?? 0);
                }

                setLoading(false);
            };

        load();
    }, [mode, schoolUrn, limit, refreshKey, localRefresh]);

    const handleDelete = async (reviewId) => {
        if (!accessToken) {
            setError("You must be signed in to delete a review.");
            return;
        }

        const confirmed = window.confirm("Delete this review?");
        if (!confirmed) return;

        const res = await fetch(`/api/reviews/${reviewId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(body.error || "Failed to delete review.");
            return;
        }

        setEditingReview(null);
        setLocalRefresh((prev) => prev + 1);
    };

    const handleHelpfulToggle = async (reviewId, currentState) => {
        if (!accessToken) {
            setError("You must be signed in to mark a review as helpful.");
            return;
        }

        const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ like: !currentState }),
        });

        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(body.error || "Failed to update helpful vote.");
            return;
        }

        const { helpful_count, helpful_voted } = body.data || {};
        setReviews((prev) =>
            prev.map((r) =>
                r.id === reviewId
                    ? {
                          ...r,
                          helpful_count: helpful_count ?? r.helpful_count ?? 0,
                          helpful_voted: typeof helpful_voted === "boolean" ? helpful_voted : r.helpful_voted,
                      }
                    : r
            )
        );
    };

        
    return (
        <section className={`${sectionClassName} px-6`}>
            {mode === "school" && !loading && !error && schoolScore !== null ? (
                <div className="mt-16 mb-3 flex items-center justify-between">
                    <h2 className="text-5xl mb-3 font-bold text-brand-brown dark:text-brand-orange">
                        School score: {schoolScore.toFixed(1)} / 5
                    </h2>
                <div className="shrink-0">{headerRight}</div>
            </div>
        ) : (
            headerRight ? (
                <div className="mt-16 mb-3 flex items-center justify-end">
                    <div className="shrink-0">{headerRight}</div>
                </div>
            ) : null
        )}

            {showTitle ? (
    <h3 className="mb-3 mt-4 text-brand-blue dark:text-brand-white">
      Reviews:
    </h3>
  ) : null}
                
            
              

            {loading && <p className="text-sm text-brand-cream dark:text-brand-cream">Loading reviews...</p>}

            {mode === "school" && editingReview ? (
            <ReviewForm
                schoolUrn={schoolUrn}
                reviewId={editingReview.id}
                initialData={editingReview}
                onCancel={() => setEditingReview(null)}
                onPosted={() => {
                setEditingReview(null);
                setLocalRefresh((prev) => prev + 1);
                }}
            />
            ) : null}


            {loading && <p className="text-sm text-brand-cream dark:text-brand-cream">Loading reviews...</p>}
            {error && <p className="text-sm text-brand-orange">{error}</p>}

            {!loading && !error && reviews.length === 0 && (
            <p className="text-sm text-brand-blue dark:text-brand-cream">
                {mode === "recent" ? (
                "No reviews yet."
                ) : (
                <>
                    No reviews yet.{" "}
                    <Link
                    href={`/schools/${schoolUrn}`}
                    className="underline font-semibold hover:text-brand-orange"
                    >
                    Be the first to leave a review!
                    </Link>
                </>
                )}
            </p>
            )}


            {reportingReview ? (
                <ReportForm
                    reviewId={reportingReview.id}
                    onCancel={() => setReportingReview(null)}
                    onReported={() => {
                    setReportingReview(null);
                    }}
                />
            ) : null}

{!loading && !error && reviews.length > 0 && (
  <div className={cardVariant === "home" ? "relative" : ""}>
    {/* Edge fades (home only) */}
    {cardVariant === "home" ? (
      <>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-brand-cream to-transparent dark:from-brand-brown" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-cream to-transparent dark:from-brand-brown" />
      </>
    ) : null}

    {/* ✅ New: relative wrapper around just the scroller */}
    <div className={showArrows ? "relative" : ""}>
      {/* Scroll buttons */}
      {showArrows ? (
        <>
          <button
            type="button"
            onMouseEnter={hoverScrollEnabled ? () => startHoverScroll(-1) : undefined}
            onMouseLeave={hoverScrollEnabled ? stopHoverScroll : undefined}
            onClick={() => scrollByCards(-1)}
            // disabled={!canScrollLeft}
            className={[
  "pointer-events-auto cursor-pointer",
  "absolute left-2 top-1/2 z-50 -translate-y-1/2",
  "rounded-full border border-brand-brown",
  "bg-brand-cream/90 px-3 py-2 text-sm font-semibold text-brand-brown",
  "shadow transition-all duration-200 ease-out",
  "hover:scale-110 hover:shadow-lg hover:bg-brand-orange hover:text-brand-brown",
  "active:scale-110 active:shadow-lg",
  "dark:border-brand-cream dark:bg-brand-blue/80 dark:text-brand-cream",
  "dark:hover:bg-brand-orange dark:hover:text-brand-brown dark:hover:border-brand-brown",
  canScrollLeft ? "opacity-80" : "opacity-30",
].join(" ")}
          >
            ←
          </button>

          <button
            type="button"
            onMouseEnter={hoverScrollEnabled ? () => startHoverScroll(1) : undefined}
            onMouseLeave={hoverScrollEnabled ? stopHoverScroll : undefined}
            onClick={() => scrollByCards(1)}
            disabled={!canScrollRight}
            className={[
  "pointer-events-auto cursor-pointer",
  "absolute right-2 top-1/2 z-50 -translate-y-1/2",
  "rounded-full border border-brand-brown",
  "bg-brand-cream/90 px-3 py-2 text-sm font-semibold text-brand-brown",
  "shadow transition-all duration-200 ease-out",
  "hover:scale-110 hover:shadow-lg hover:bg-brand-orange hover:text-brand-brown",
  "active:scale-110 active:shadow-lg",
  "dark:border-brand-cream dark:bg-brand-blue/80 dark:text-brand-cream",
  "dark:hover:bg-brand-orange dark:hover:text-brand-brown dark:hover:border-brand-brown",
  canScrollRight ? "opacity-80" : "opacity-30",
].join(" ")}
          >
            →
          </button>
        </>
      ) : null}

      {/* Scroller */}
      <div
        ref={scrollerRef}
        className={
          cardVariant === "home"
            ? [
                "flex gap-6 overflow-x-auto",
                "px-12 pb-4",
                "scroll-smooth",
                "snap-x snap-mandatory",
                "scrollbar-none",
                "overscroll-x-contain",
                "[-webkit-overflow-scrolling:touch]",
              ].join(" ")
            : "flex gap-4 overflow-x-auto pb-3 pr-2 scrollbar-none"
        }
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className={cardVariant === "home" ? "flex-shrink-0 snap-start" : "min-w-[360px] flex-shrink-0"}
            onClick={() => setSelectedReview(review)}
          >
        <ReviewCard
          review={review}
          variant={cardVariant}
          showEdit={cardVariant === "home" ? false : review.user_id === currentUserId}
          showDelete={cardVariant === "home" ? false : isAdmin}
          showReport={cardVariant === "home" ? false : canReport}
          showHelpful
          canHelpful={Boolean(accessToken)}
          onEdit={() => {
            setReportingReview(null);
            setEditingReview(review);
          }}
          onDelete={() => handleDelete(review.id)}
          onReport={() => {
            setEditingReview(null);
            setReportingReview(review);
          }}
          onHelpfulToggle={() => handleHelpfulToggle(review.id, review.helpful_voted)}
        />
         </div>
        ))}
      </div>
    </div>
  </div>
)}
            <ReviewModal
                open={Boolean(selectedReview)}
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
            />
        </section>
    );
}
