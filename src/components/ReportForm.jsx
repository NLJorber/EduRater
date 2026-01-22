"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function ReportForm({
    reviewId,
    onCancel,
    onReported,
}) {

    const [reason, setReason] = useState("");
    const [status, setStatus] = useState({ type: "idle", message: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanReason = reason.trim();
        if (!cleanReason) {
            setStatus({ type: "error", message: "Please provide a reason for reporting." });
            return;
        }

        setStatus({ type: "loading", message: "Submitting report..." });

        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        const token = data?.session?.access_token;

        if (sessionError || !token) {
            setStatus({ type: "error", message: "You must be signed in to report a review." });
            return;
        }

        const res = await fetch(`/api/reviews/${reviewId}/report`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: cleanReason }),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            setStatus({ type: "error", message: body.error || "Failed to submit report." });
            return;
        }

        setStatus({ type: "success", message: "Report submitted successfully." });
        setReason("");
        onReported?.();
    };

    return (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-white">Report review</h3>
                <button
                type="button"
                onClick={onCancel}
                className="text-sm font-semibold text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Reason (required)
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
                    placeholder="Explain why you're reporting this review..."
                    rows={4}
                    required
                />
                </div>

                <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={status.type === "loading"}
                    className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                    Submit report
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                    Cancel
                </button>
                </div>

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
