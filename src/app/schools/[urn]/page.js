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

import CreateReviewModal from "@/components/CreateReviewModal";



export default function SchoolDetailPage() {
    /* reads the route parameter from the URL */
    const { urn } = useParams();

    const [school, setSchool] = useState(null); /* holds the fetched school object, starting with null before loading */
    const [reviewing, setReviewing] = useState(false); /* controls whether the review form is shown */
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    /* state to hold the logged in user's data */
    const [user, setUser] = useState(null);

    /* refresh key state so the list refreshes after posting a review */
    const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!urn) return;

    // Force top of page whenever a new school is opened
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [urn]);

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

    if (loading) return <div className="min-h-screen p-10 bg-brand-cream dark:bg-brand-brown">Loading...</div>; 
    if (error) return <div className="p-10 text-brand-orange">{error}</div>;
    if (!school) return <div className="p-10">School not found</div>;

  return (
  <div className="min-h-screen p-6 bg-brand-cream dark:bg-brand-brown display-headings">
    {/* FULL-WIDTH HEADER */}
    <h2 className="mt-16 mb-4 text-center text-brand-orange dark:text-brand-orange">
      {school.EstablishmentName}
    </h2>

    <hr className="border-brand-brown dark:border-brand-cream mb-6" />

    {/* MAIN LAYOUT: 2/5 left, 3/5 right */}
    <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10">
      {/* LEFT: 2/5 */}

      <div className="rounded-lg border border-brand-brown/20 bg-brand-cream p-6 shadow-sm dark:border-brand-lightgrey/30 dark:bg-brand-brown/20">
  <SchoolPage school={school} />
</div>


      {/* RIGHT: 3/5 */}

{/* RIGHT: 3/5 */}
<div className="rounded-lg border border-brand-brown/20 bg-brand-cream p-6 shadow-sm dark:border-brand-lightgrey/30 dark:bg-brand-brown/20">
  <ReviewsRow schoolUrn={urn} 
  refreshKey={refreshKey} 
  headerRight={
    user ? (
    <button
      type="button"
      onClick={() => setReviewing(true)}
      className="shrink-0 rounded-md bg-brand-brown dark:bg-brand-blue px-4 py-2 font-semibold text-brand-cream hover:bg-brand-orange disabled:opacity-60"
    >
      Leave a Review
    </button>
  ) : null
  }
/>
</div>

      {/* FULL-WIDTH BELOW BOTH COLUMNS */}
      <div className="lg:col-span-2 pl-36 pr-36">
        {user ? (
       <CreateReviewModal
        open={reviewing}
        onClose={() => setReviewing(false)}      
        >
        <ReviewForm
          schoolUrn={urn}
          onPosted={() => {
            setRefreshKey((prev) => prev + 1);
            setReviewing(false);
          }}
        />
      </CreateReviewModal>
        ) : (
          <div className="mt-6 rounded-lg border border-brand-brown bg-brand-cream p-4 dark:border-brand-orange dark:bg-brand-orange text-center">
            <h5 className="text-brand-brown dark:text-brand-brown">
              You must be signed in to leave a review.
            </h5>
            <Link href="/login" className="mt-2 inline-block font-semibold text-brand-cream">
              <h6 style={{ letterSpacing: "0.15em" }}>~Click to sign in~</h6>
            </Link>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
