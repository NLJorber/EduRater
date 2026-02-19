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
  refreshKey,
  headerRight = null,
  cardVariant = "default",
  showTitle = true,
  sectionClassName = "",
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

    const scrollerRef = useRef(null);
    const hoverScrollRef = useRef(null);

    const startHoverScroll = (dir) => {
        if (hoverScrollRef.current) return;

            hoverScrollRef.current = setInterval(() => {
            scrollerRef.current?.scrollBy({
            left: dir * 6, // speed (px per tick)
            behavior: "auto",
        });
        }, 16); // ~60fps
    };

        const stopHoverScroll = () => {
        if (hoverScrollRef.current) {
            clearInterval(hoverScrollRef.current);
            hoverScrollRef.current = null;
        }
        };

    const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    // scroll by ~1 card (adjust if you change card width)
    const amount = Math.min(520, el.clientWidth * 0.8) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
    };


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
                    ? `/api/reviews?sort=recent&limit=${encodeURIComponent(limit)}`
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

        
    return (
        <section className={"sectionClassName"}>
            {showTitle ? (
            <div className="display-headings mb-3 flex items-end justify-between">
                <h3 className="mt-8 font-semibold text-brand-blue dark:text-brand-orange">
                    Reviews:
                </h3>
                {headerRight}
            </div>
            ) : (
                headerRight ? (
                    <div className="mb-3 flex items-end justify-end">{headerRight}</div>
                ) : null
            )}
            {!loading && !error && schoolScore !== null && (
                <h4 className="mb-3 text-brand-brown dark:text-brand-cream">
                    School score: {schoolScore.toFixed(1)} / 5
                </h4>
            )}

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
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-brand-cream to-transparent dark:from-blue-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-brand-cream to-transparent dark:from-blue-950" />
    </>
  ) : null}

  {/* Scroll buttons (home only) */}
  {cardVariant === "home" ? (
    <>
      <button
        type="button"
        onMouseEnter={() => startHoverScroll(-1)}
        onMouseLeave={stopHoverScroll}

        onClick={() => scrollByCards(-1)}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-brand-brown bg-brand-cream/90 px-3 py-2 text-sm font-semibold text-brand-brown shadow hover:bg-brand-cream dark:border-brand-cream dark:bg-blue-900/80 dark:text-brand-cream"
        aria-label="Scroll reviews left"
      >
        ←
      </button>
      <button
        type="button"
        onMouseEnter={() => startHoverScroll(1)}
        onMouseLeave={stopHoverScroll}

        onClick={() => scrollByCards(1)}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-brand-brown bg-brand-cream/90 px-3 py-2 text-sm font-semibold text-brand-brown shadow hover:bg-brand-cream dark:border-brand-cream dark:bg-blue-900/80 dark:text-brand-cream"
        aria-label="Scroll reviews right"
      >
        →
      </button>
    </>
  ) : null}

  <div
    ref={scrollerRef}
    className={
      cardVariant === "home"
        ? [
            "flex gap-6 overflow-x-auto",
            "px-12 pb-4",                  // prevents edge cut-off + leaves room for arrows
            "scroll-smooth",               // animated scrolling
            "snap-x snap-mandatory",       // professional snapping
            "scrollbar-none",              // hide scrollbar (utility added below)
            "overscroll-x-contain",
            "[-webkit-overflow-scrolling:touch]",
          ].join(" ")
        : "flex gap-4 overflow-x-auto pb-3 pr-2"
    }
    style={{
      scrollPaddingLeft: cardVariant === "home" ? "3rem" : undefined,
      scrollPaddingRight: cardVariant === "home" ? "3rem" : undefined,
    }}
  >
    {reviews.map((review) => (
      <div
        key={review.id}
        className={
          cardVariant === "home"
            ? "flex-shrink-0 snap-start"
            : "min-w-[360px] flex-shrink-0"
        }
        onClick={() => setSelectedReview(review)}
      >
        <ReviewCard
          review={review}
          variant={cardVariant}
          showEdit={review.user_id === currentUserId}
          showDelete={isAdmin}
          showReport={canReport}
          onEdit={() => {
            setReportingReview(null);
            setEditingReview(review);
          }}
          onDelete={() => handleDelete(review.id)}
          onReport={() => {
            setEditingReview(null);
            setReportingReview(review);
          }}
        />
      </div>
    ))}
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
