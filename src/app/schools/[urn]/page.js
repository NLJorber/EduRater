"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* imports the SchoolPage component which displays the page for a specific school */
import SchoolPage from "@/components/SchoolPage";

export default function SchoolDetailPage() {
    /* reads the route parameter from the URL */
    const { urn } = useParams();

    const [school, setSchool] = useState(null); /* holds the fetched school object, starting with null before loading */
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

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
    if (error) return <div className="p-10 text-red-600">{error}</div>;
    if (!school) return <div className="p-10">School not found</div>;

    return (
        /* passes the loaded school object as a prop to SchoolPage to load the component */
        <div className="min-h-screen p-6 bg-white dark:bg-gray-900">
            <SchoolPage school={school} />
        </div>
    );
}