"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function ReviewForm({ schoolUrn, onPosted }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [rating, setRating] = useState("");
    const [status, setStatus] = useState({ type: "idle", message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Posting review..." });

        const {
            data: { user },
            error: userErr,
        } = await supabaseClient.auth.getUser();

        if (userErr || !user) {
            setStatus({ type: "error", message: "You must be logged in to post a review." });
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
            setStatus({ type: "error", message: "Rating must be a number between 0 and 5." });
            return;
        }

        const { error } = await supabaseClient.from("reviews").insert({
            user_id: user.id,
            school_urn: Number(schoolUrn),
            title: cleanTitle || null,
            body: cleanBody,
            rating: numRating,
        });

        if (error) {
            setStatus({ type: "error", message: error.message || "Failed to post review." });
            return;
        }

        setTitle("");
        setBody("");
        setRating("");
        setStatus({ type: "info", message: "Review posted successfully!" });

        onPosted?.();
    };

    return (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-black dark:text-white">
                Leave a review
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
                        Rating (0-5)
                    </label>
                    <input
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
                        required
                    />
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

                <button
                    type="submit"
                    disabled={status.type === "loading"}
                    className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    Post
                </button>

                {status.type !== "idle" && (
                    <p
                        className={`text-sm ${
                            status.type === "error" ? "text-red-600" : "text-gray-600 dark:text-gray-300"
                        }`}
                    >
                        {status.message}
                    </p>
                )}
            </form>
        </div>
    );
}