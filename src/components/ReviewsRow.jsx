"use client";

import { useEffect, useState } from "react";
import ReviewCard from "@/components/ReviewCard";
import ReviewForm from "@/components/ReviewForm";
import ReportForm from "@/components/ReportForm";
import ReviewModal from "@/components/ReviewModal";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

/* schoolUrn: URN of the school to load reviews for
    refreshKey: when this changes, reviews are reloaded */
export default function ReviewsRow({ schoolUrn, refreshKey, headerRight = null }) {
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
            if (!schoolUrn) return;

            setLoading(true);
            setError("");
            
            const res = await fetch(`/api/reviews?school_urn=${encodeURIComponent(schoolUrn)}`);
            const body = await res.json();

            if (!res.ok) {
                setError(body.error || "Failed to load reviews.");
                setReviews([]);
                setSchoolScore(null);
                setReviewCount(0);
                setLoading(false);
                return;
            }

            setReviews(body.data?.reviews || []);
            setSchoolScore(body.data?.schoolScore ?? null);
            setReviewCount(body.data?.reviewCount ?? 0);
            setLoading(false);
        };

        load();
    }, [schoolUrn, refreshKey, localRefresh]);

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
        <section className="mt-8">
            <div className="display-headings mb-3 flex items-end justify-between">
                <h3 className="mt-8 font-semibold text-brand-orange dark:text-brand-orange">
                    Reviews:
                </h3>
                
                {headerRight}
            </div>
            {!loading && !error && schoolScore !== null && (
                <h4 className="mb-3 text-brand-brown dark:text-brand-cream">
                    School score: {schoolScore.toFixed(1)} / 5
                </h4>
            )}

            {loading && <p className="text-sm text-brand-cream dark:text-brand-cream">Loading reviews...</p>}

            {editingReview ? (
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
                    No reviews yet. Be the first to leave a review!
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
                <div className="flex gap-4 overflow-x-auto pb-3 pr-2">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="min-w-[360px] flex-shrink-0 cursor-pointer"
                            onClick={() => setSelectedReview(review)}
                        >
                            <ReviewCard
                                key={review.id}
                                review={review}
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
            )}
            <ReviewModal
                open={Boolean(selectedReview)}
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
            />
        </section>
    );
}
