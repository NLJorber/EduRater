"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SchoolCard from "@/components/School";

export default function SchoolsPage() {
    const searchParams = useSearchParams();
    const town = (searchParams.get("town") || "").trim();

    const [schools, setSchools] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setError("");
            setSchools([]);

            if (!town) {
                setError("Please provide a town to search for schools.");
                return;
            }

            setLoading(true);

            const res = await fetch(`/api/schools?town=${encodeURIComponent(town)}&limit=200`);
            const body = await res.json();

            if (!res.ok) {
                setError(body.error || "An unknown error occurred.");
                setLoading(false);
                return;
            }

            setSchools(body.data || []);
            setLoading(false);
        };

        load();

    }, [town]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-10">
            <h1 className="text-3xl font-bold text-black dark:text-white">
                Schools in {town || "…"}
            </h1>

            {loading && <p className="mt-4">Loading…</p>}
            {error && <p className="mt-4 text-red-600">{error}</p>}

            {!loading && !error && schools.length === 0 && town && (
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                No schools found for “{town}”.
                </p>
            )}

            <div className="mt-6 grid gap-4">
                {schools.map((school, num) => (
                <SchoolCard key={school.URN} school={school} num={num} />
                ))}
            </div>
        </div>
    )
}