"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

import Link from "next/link";

/* imports the SchoolPage component which displays the page for a specific school */
import SchoolPage from "@/components/SchoolPage";

/* imports the ReviewForm component for posting reviews */
import ReviewForm from "@/components/ReviewForm";

/* import ReviewsRow to show list of reviews for the school */
import ReviewsRow from "@/components/ReviewsRow";

export default function SchoolDetailPage() {
    /* reads the route parameter from the URL */
    const { urn } = useParams();

    const [school, setSchool] = useState(null); /* holds the fetched school object, starting with null before loading */
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    /* state to hold the logged in user's data */
    const [user, setUser] = useState(null);

    /* refresh key state so the list refreshes after posting a review */
    const [refreshKey, setRefreshKey] = useState(0);

    /* effect to load the user and keep it updated */
    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabaseClient.auth.getUser();
            setUser(data?.user ?? null);
        };

        loadUser();

        const { data: sub } = supabaseClient.auth.onAuthStateChange(() => {
            loadUser();
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    /* fetch school when urn changes */
    useEffect(() => {
        const load = async () => {
            setLoading(true);   /* sets loading to true */
            setError("");       /* clears out previous error messages */
            setSchool(null);    /* reset the previous school data */

            /* calls API route /api/schools with urn and limit=1 to get a single school */
            const res = await fetch(`/api/schools?urn=${encodeURIComponent(urn)}&limit=1`);

            /* converts JSON response to a JS object */
            const body = await res.json();

            /* sets readable error message if res.ok is false */
            if (!res.ok) {
                setError(body.error || "Failed to load school data.");
                setLoading(false);
                return;
            }

            /* if data is found, take the first item of the array */
            const found = body.data?.[0] ?? null;

            /* handles no school being found and returns error message */
            if (!found) {
                setError("School not found");
                setLoading(false);
                return;
            }

            setSchool(found);   /* stores school found in state */
            setLoading(false);  /* stops loading */
        };

        if (urn) load();    /* prevents the API call if urn is missing */
    }, [urn]);

    if (loading) return <div className="p-10">Loading...</div>; 
    if (error) return <div className="p-10 text-brand-red">{error}</div>;
    if (!school) return <div className="p-10">School not found</div>;

    return (
        /* passes the loaded school object as a prop to SchoolPage to load the component */
        <div className="min-h-screen p-6 bg-brand-azure dark:bg-brand-darkblue">
            <SchoolPage school={school} />

            <ReviewsRow schoolUrn={urn} refreshKey={refreshKey} />

            {/* only show review form if user is logged in */}
            {user ? (
                <ReviewForm schoolUrn={urn} />
            ) : (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-gray-700 dark:text-gray-200">
                        You must be signed in to leave a review.
                    </p>
                    <Link href="/login" className="mt-2 inline-block font-semibold text-blue-600">
                        Sign in
                    </Link>
                </div>
            )}
        </div>
    );
}