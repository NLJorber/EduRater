"use client";

/* lets component store and update values */
import { useState, useEffect } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";
import IconsScroll from "@/components/IconsScroll";
import RecommendationCard from "@/components/Recommendation";
import Link from "next/link";

export default function Home() {
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState("all");
  const [radiusKm, setRadiusKm] = useState(25);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSearch = () => {
    const term = q.trim();
    if (!term) return;

    const phaseParam = phase !== "all" ? `&phase=${encodeURIComponent(phase)}` : "";
    const limitParam = phase !== "all" ? "&limit=100" : "";
    const radiusParam = `&radiusKm=${encodeURIComponent(radiusKm)}`;
    /* navigate to the schools page with the query as a query parameter */
    router.push(
      `/schools?q=${encodeURIComponent(term)}${phaseParam}${limitParam}${radiusParam}`
    )
  }

  const icons = [
    "/icons/Book.png",
    "/icons/Flask.png",
    "/icons/Division.png",
    "/icons/Paintbrush.png",
    "/icons/Pi.png",
    "/icons/Plus.png",
    "/icons/Atom.png",
    "/icons/Sodium.png"
  ];

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    const load = async () => {
      setError("");
      setSuggestions([]);
      
      setSuggestionLoading(true);
      const phaseParam = phase !== "all" ? `&phase=${encodeURIComponent(phase)}` : "";
      const response = await fetch(`/api/schools?q=${encodeURIComponent(term)}${phaseParam}&limit=5`);
      const body = await response.json();

      if (!response.ok) {
        setError(body.error || "An error occurred while fetching suggestions.");
        setSuggestionLoading(false);
        return;
      }

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
      setSuggestions(filtered);
      console.log("Suggestions:", filtered);
      setSuggestionLoading(false);
    };

      load();
  }, [q, phase, radiusKm]);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="relative display-headings w-full min-h-[44vh] flex items-center justify-center bg-brand-blue">
        <IconsScroll icons={icons} size={44} rows={7} speed={300}/>

        <div className="relative z-10 px-6 text-center">
          <h1 className="font-extrabold text-brand-brown dark:text-white">
            Welcome to <br />
            <span className="text-brand-cream dark:text-brand-orange">EduRater</span>
          </h1>
        </div>
      </header>

      {/* SEARCH AREA */}
      <section className="flex-1 w-full bg-brand-cream dark:bg-brand-brown flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <form
            className="w-full flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row rounded-md border border-brand-brown px-4 py-2 text-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Range {radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full"
              />
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full rounded-md border border-brand-brown px-4 py-2 text-brand-blue focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream sm:w-44"
              >
                <option value="all">All phases</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="nursery">Nursery</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}   /* update q state on input change */
                placeholder="Search for schools..."
                className="w-full rounded-md border border-brand-brown px-4 py-2 text-brand-blue placeholder:text-brand-brown focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream dark:placeholder-brand-cream"
              />
              <button
                type="button"
                onClick={onSearch}    
                className="self-center rounded-md px-6 py-3 bg-brand-brown dark:bg-brand-cream text-brand-cream dark:text-brand-brown font-bold hover:bg-brand-orange dark:hover:bg-brand-blue hover:text-white dark:hover:text-brand-cream focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
            
            {suggestionLoading && (
              <p className="text-sm text-brand-brown dark:text-brand-cream">Loading suggestions...</p>
            )}

            {suggestions.length > 0 && (
              <div className="flex align-center bg-brand-brown dark:bg-brand-cream p-4 rounded-md border border-brand-brown dark:border-brand-cream">
                <div className="divide-y divide-brand-cream/30 dark:divide-brand-blue/30">
                  {suggestions.map((suggestion) => (
                    <Link
                      key={suggestion.URN}
                      href={`/schools/${suggestion.URN}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-brand-blue hover:scale-[1.01] transition"
                    >
                      <RecommendationCard key={suggestion.URN} school={suggestion} />
                    </Link>
                  ))}
                </div>
              </div>
            )}  
          </form>
        </div>
      </section>
    </main>
  );
}
