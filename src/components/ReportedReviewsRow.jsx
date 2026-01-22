/*
    REPORTED REVIEWS COMPONENT

    - fetches reported reviews from the review-reports API
    - shows loading, error, no reports, or list of reported reviews
*/

"use client"; // indicates this is a client-side component

// useState stores component state (token, list of reports, loading, error)
// useEffect runs side effects after render (get session, fetch reports)
import { useEffect, useState } from "react";

import { supabaseClient } from "@/lib/supabase/client"; // browser-side Supabase client for reading the current session/token
import ReviewCard from "@/components/ReviewCard";   // UI component that displays the review content for each report

// defines reusable reported reviews component for admin dashboard page
export default function ReportedReviewsRow() {
const [accessToken, setAccessToken] = useState("");   // holds logged in user's access token for API requests
const [rows, setRows] = useState([]);         // array of report rows fetched from the review-reports API
const [loading, setLoading] = useState(true); // true while loading reports
const [error, setError] = useState("");       // message to show if something fails

// runs once on mount because dependency array is empty
useEffect(() => {
        /*
            asks Supabase auth what the current session is
            if yes, sets the access token for API requests
            if no session, stores an empty string
        */
        const loadSession = async () => {
            const { data } = await supabaseClient.auth.getSession();
            setAccessToken(data?.session?.access_token ?? "");
        };

        loadSession();

        // listens for sign in and sign out events to automatically update the access token state
        const { data: sub } = supabaseClient.auth.onAuthStateChange((_e, session) => {
            setAccessToken(session?.access_token ?? "");
        });

        // stop listening when the component unmounts to prevent memory leaks
        return () => sub.subscription.unsubscribe();
    }, []);

    // this effect runs whenever the accessToken state changes
    useEffect(() => {
        const load = async () => {
            // if no access token, don't try to load reported reviews
            if (!accessToken) return;

            setLoading(true);   // turn on loading state
            setError("");   // clear any previous error message

            // fetch reported reviews from the API, passing the access token in the Authorization header
            const res = await fetch("/api/admin/review-reports?limit=200", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const body = await res.json().catch(() => ({}));    // parse JSON response, default to empty object on failure

            // if response not OK, show error message and clear rows
            if (!res.ok) {
                setError(body.error || "Failed to load reported reviews.");
                setRows([]);
                setLoading(false);
                return;
            }

            // if response OK, store the array of reported reviews in state
            setRows(body.data ?? []);
            setLoading(false);
        };

        // runs whenever accessToken changes
        load();
    }, [accessToken]);

    return (
        <section className="mt-10">
            <div className="mb-3 flex items-end justify-between">
                <h2 className="text-lg font-semibold">Reported reviews</h2>

                {/* show X reports only when you have a stable result */}
                {!loading && !error && (
                    <p className="text-sm text-slate-600">{rows.length} reports</p>
                )}
            </div>
            
            {/* show loading when loading === true */}
            {loading && <p className="text-sm text-slate-600">Loading…</p>}

            {/* show error message if error exists */}
            {error && <p className="text-sm text-red-600">{error}</p>}
            
            {/* show no reports message if not loading, no error, and rows is empty */}
            {!loading && !error && rows.length === 0 && (
                <p className="text-sm text-slate-600">No reports 🎉</p>
            )}

            {/* show the list of reported reviews when not loading, no error, and rows exist */}
            {!loading && !error && rows.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-3 pr-2">

                    {/* map each reported review row to a ReviewCard component inside a div */}
                    {rows.map((r) => (
                        <div key={r.id} className="min-w-[360px] shrink-0">
                            <div className="mb-2 text-xs text-slate-600">
                                <b>Reason:</b> {r.reason || "No reason provided"} <br />
                                <b>Reported:</b> {new Date(r.created_at).toLocaleString()}
                            </div>

                            {/* show the actual review content using ReviewCard component */}
                            <ReviewCard review={r.review} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
