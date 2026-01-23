"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Tells SchoolsMap to load in browser, not server, and to not load during server side rendering
const SchoolsMap = dynamic(() => import("@/components/SchoolsMap"), { ssr: false });

/* SchoolCard component which displays each school found */
import SchoolCard from "@/components/School";

export default function SchoolsPage() {
    
    const searchParams = useSearchParams();
    const q = (searchParams.get("q") || "").trim();
    const phase = (searchParams.get("phase") || "all").trim().toLowerCase();
    const radiusParam = searchParams.get("radiusKm");
    const radiusKm = Number.isFinite(Number(radiusParam))
        ? Math.min(Math.max(Number(radiusParam), 1), 40)
        : 25;

    const [nextQ, setNextQ] = useState("");
    const [nextPhase, setNextPhase] = useState("all");
    const [nextRadius, setNextRadius] = useState(25);
    const router = useRouter();

    const [schools, setSchools] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        const term = nextQ.trim();
        if (!term) return;

        const phaseParam = nextPhase !== "all" ? `&phase=${encodeURIComponent(nextPhase)}` : "";
        const limitParam = nextPhase !== "all" ? "&limit=100" : "";
        const radiusParam = `&radiusKm=${encodeURIComponent(nextRadius)}`;
        /* navigate to the schools page with the query as a query parameter */
        router.push(`/schools?q=${encodeURIComponent(term)}${phaseParam}${limitParam}${radiusParam}`)
    }

    useEffect(() => {
        setNextQ(q);
        setNextPhase(phase || "all");
        setNextRadius(radiusKm);
    }, [q, phase, radiusKm]);

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
            const phaseParam = phase !== "all" ? `&phase=${encodeURIComponent(phase)}` : "";
            const limitParam = phase !== "all" ? "&limit=100" : "&limit=30";
            const radiusQuery = `&radiusKm=${encodeURIComponent(radiusKm)}`;
            const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}${limitParam}${phaseParam}${radiusQuery}`);
            const body = await res.json();  /* parses the JSON response into a JS object */

            /* handles server errors if res.ok is false */
            if (!res.ok) {
                setError(body.error || "An unknown error occurred.");
                setLoading(false);
                return;
            }

            /* put returned schools into state and stop laoding */
            const rows = body.data || [];
            const normalizedPhase = (phase || "all").toLowerCase();
            const filtered =
                normalizedPhase === "all"
                    ? rows
                    : rows.filter((row) => {
                          const raw = `${row?.["PhaseOfEducation (name)"] || ""}`.toLowerCase();
                          if (!raw) return false;
                          if (normalizedPhase === "primary") return raw.includes("primary");
                          if (normalizedPhase === "secondary") return raw.includes("secondary");
                          if (normalizedPhase === "nursery") return raw.includes("nursery");
                          return raw.includes(normalizedPhase);
                      });
            setSchools(filtered);
            setLoading(false);
        };

        load();

    }, [q, phase, radiusKm]);

    return (
        <div className="display-headings min-h-screen text-brand-orange dark:text-brand-cream bg-brand-cream dark:bg-brand-brown p-4 md:px-32 py-6">
            {/* heading showing "Schools in (current query)" */}
            <h2 className="font-bold !tracking-normal !leading-snug">
            Schools in {q || "…"}
            </h2>

            <div className="w-full max-w-lg pt-2">
                <form
                    className="w-full flex flex-col gap-3 sm:flex-row"
                    onSubmit={(e) => {
                    e.preventDefault();
                    onSearch();
                    }}
                >
                    <input
                    type="text"
                    value={nextQ}
                    onChange={(e) => setNextQ(e.target.value)}
                    placeholder="Search for schools..."
                    className="w-full rounded-md border border-brand-brown px-4 py-2 text-brand-blue placeholder:text-brand-brown focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream dark:placeholder-brand-cream"
                    />

                    <select
                    value={nextPhase}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNextPhase(value);
                      if (nextQ.trim()) {
                        const phaseParam = value !== "all" ? `&phase=${encodeURIComponent(value)}` : "";
                        const limitParam = value !== "all" ? "&limit=100" : "";
                        const radiusParam = `&radiusKm=${encodeURIComponent(nextRadius)}`;
                        router.push(`/schools?q=${encodeURIComponent(nextQ.trim())}${phaseParam}${limitParam}${radiusParam}`);
                      }
                    }}
                    className="w-full rounded-md border border-brand-brown px-4 py-2 text-brand-blue focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream sm:w-44"
                    >
                    <option value="all">All phases</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="nursery">Nursery</option>
                    </select>

                    <button
                    type="submit"
                    className="self-center rounded-md px-6 py-3 bg-brand-brown dark:bg-brand-cream text-brand-cream dark:text-brand-brown font-bold hover:bg-brand-orange dark:hover:bg-brand-blue hover:text-white dark:hover:text-brand-cream focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                    Search
                    </button>
                </form>
                <div className="mt-3 rounded-md border border-brand-brown px-4 py-3 text-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream">
                    <div className="flex items-center justify-between text-sm font-semibold">
                        <span>Range</span>
                        <span>{nextRadius} km</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="40"
                        step="1"
                        value={nextRadius}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setNextRadius(value);
                        }}
                        className="mt-2 w-full"
                    />
                </div>
            </div>

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
