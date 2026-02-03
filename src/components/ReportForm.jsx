/*
    ReportForm.jsx
    Component for reporting a review

    - if reason empty, shows error
    - if not logged in, shows error
    - on submit, sends POST to /api/reviews/[id]/report with reason
    - shows loading, error, or success messages based on submission status
*/

"use client";   // makes the component run in the browser

// lets the component store and update values (reason text, status messages)
import { useState } from "react";

// browser-side Supabase client for getting the current session and access token
import { supabaseClient } from "@/lib/supabase/client";

/*
    component definition + props
    - reviewId: the ID of the review being reported
    - onCancel: function to call when the user cancels reporting
    - onReported: function to call after a successful report submission
*/
export default function ReportForm({
    reviewId,
    onCancel,
    onReported,
}) {

    const [reason, setReason] = useState("");   // stores and updates what the user typed as the reason in the textarea
    const [status, setStatus] = useState({ type: "idle", message: "" });    // stores and updates the status of the form submission

    // called when the user submits the report form
    const handleSubmit = async (e) => {
        // prevents the default form submission behavior (page reload)
        e.preventDefault();

        // removes leading/trailing whitespace from reason and checkks if it's empty
        const cleanReason = reason.trim();
        if (!cleanReason) {
            setStatus({ type: "error", message: "Please provide a reason for reporting." });
            return;
        }

        // updates the UI to show that the report is being submitted
        setStatus({ type: "loading", message: "Submitting report..." });

        // asks Supabase for the current session to get the access token
        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        const token = data?.session?.access_token;  // access token is what is sent to the API route in the Authorization header

        // if there was an error getting the session or no token, show an error message
        if (sessionError || !token) {
            setStatus({ type: "error", message: "You must be signed in to report a review." });
            return;
        }

        // sends a POST request to the review report API route with the review ID and reason
        const res = await fetch(`/api/reviews/${reviewId}/report`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,   // proves who the user is
                "Content-Type": "application/json", // tells the server we're sending JSON data
            },
            body: JSON.stringify({ reason: cleanReason }),  // sends the reason in the request body
        });

        const body = await res.json().catch(() => ({}));    // tries to parse JSON response, defaults to empty object on failure

        // handles failed responses from the API
        if (!res.ok) {
            setStatus({ type: "error", message: body.error || "Failed to submit report." });
            return;
        }

        // sets a success message, clears the reason, and calls the onReported callback
        setStatus({ type: "success", message: "Report submitted successfully." });
        setReason("");
        onReported?.();
    };

    return (
        <div className="my-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black dark:text-white">Report review</h3>

                {/* cancel button calls onCancel when clicked
                    type = "button" so it doesn't submit the form */}
                <button
                type="button"
                onClick={onCancel}
                className="text-sm font-semibold text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                Cancel
                </button>
            </div>

            {/* connecting onSubmit=handleSubmit means clicking submit report triggers handleSubmit */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Reason (required)
                </label>

                {/* textarea for user to type their reason for reporting, updating setReason on every keystroke */}
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-black dark:text-white"
                    placeholder="Explain why you're reporting this review..."
                    rows={4}
                    required /* makes the textarea required */
                />
                </div>

                <div className="flex gap-2">

                    {/* submits the form, disabled while loading to prevent double submissions */}
                    <button
                        type="submit"
                        disabled={status.type === "loading"}
                        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        Submit report
                    </button>

                    {/* cancel button calls onCancel when clicked */}
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                </div>
                
                {/* shows status messages based on the current status type if not idle */}
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
