"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import ReviewCard from "@/components/ReviewCard";

export default function ReviewsRow({ schoolUrn, refreshKey = 0 }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            if (!schoolUrn) return;

            setLoading(true);
            setError("");
            
            const { data, error } = await supabaseClient
                .from("reviews")
                .select("id, title, body, rating, created_at")
                .eq("school_urn", Number(schoolUrn))
                .is("deleted_at", null)
                .order("created_at", { ascending: false })

            if (error) {
                setError(error.message);
                setReviews([]);
                setLoading(false);
                return;
            }

            setReviews(data || []);
            setLoading(false);
        };

        load();
    }, [schoolUrn, refreshKey]);

    return (
        <section className="mt-8">
            <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    Reviews
                </h2>
                {!loading && !error && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {reviews.length} total
                    </p>
                )}
            </div>

            {loading && <p className="text-sm text-gray-600 dark:text-gray-300">Loading reviews...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!loading && !error && reviews.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    No reviews yet. Be the first to leave a review!
                </p>
            )}

            {!loading && !error && reviews.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-3 pr-2">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </section>
    );
}