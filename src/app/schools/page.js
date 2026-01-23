"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Tells SchoolsMap to load in browser, not server, and to not load during server side rendering
const SchoolsMap = dynamic(() => import("@/components/SchoolsMap"), { ssr: false });

/* SchoolCard component which displays each school found */
import SchoolCard from "@/components/School";

export default function SchoolsPage() {
    
    const searchParams = useSearchParams();
    const q = (searchParams.get("q") || "").trim();

    const [schools, setSchools] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    /* fetch schools data when q changes */
    useEffect(() => {
        const load = async () => {
            setError("");   /* clear old error messages */
            setSchools([]); /* clear old schools data */

            /* return error if no query is provided */
            if (!q) {
                setError("Please provide a query to search for schools.");
                return;
            }

            /* lets UI show "Loading..." */
            setLoading(true);

            /* calls /api/schools with q and limit provided */
            const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}&limit=30`);
            const body = await res.json();  /* parses the JSON response into a JS object */

            /* handles server errors if res.ok is false */
            if (!res.ok) {
                setError(body.error || "An unknown error occurred.");
                setLoading(false);
                return;
            }

            /* put returned schools into state and stop laoding */
            setSchools(body.data || []);
            setLoading(false);
        };

        load();

    }, [q]);

    return (
        <div className="display-headings min-h-screen text-brand-orange dark:text-brand-cream bg-brand-cream dark:bg-brand-brown p-35">
            {/* heading showing "Schools in (current query)" */}
            <h2 className="font-bold !tracking-normal !leading-snug">
            Schools in {q || "…"}
            </h2>

            {loading && <p className="mt-4">Loading…</p>}

            {error && <p className="mt-4 text-brand-orange">{error}</p>}

            {/* renders no results if no schools were found */}
            {!loading && !error && schools.length === 0 && q && (
                <p className="mt-4 text-brand-blue dark:text-brand-cream">
                No schools found for “{q}”.
                </p>
            )}

            {/* map */}
            {!loading && !error && schools.length > 0 && (
            <div className="mt-6 rounded-lg overflow-hidden">
            <SchoolsMap schools={schools} />
            </div>
            )}



            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* loops over the array of schools returning the school and its index num */}
                {schools.map((school, num) => (
                <Link
                    key={school.URN}
                    /* href sends you to individual school page when clicked */
                    href={`/schools/${school.URN}`}
                    className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue hover:scale-[1.01] transition"
                >
                    
                        {/* use URN as key due to it being unique to each school */}
                        <SchoolCard key={school.URN} school={school} num={num} />
                    
                </Link>
                ))}
            </div>
        </div>
    )
}