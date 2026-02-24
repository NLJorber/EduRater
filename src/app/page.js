"use client";

/* lets component store and update values */
import { useState, useEffect } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";  

const IconsScroll = dynamic(() => import("@/components/IconsScroll"), {
  ssr: false,
});

import RecommendationCard from "@/components/Recommendation";
import Link from "next/link";
import { MagnetizeButton } from "@/components/ui/magnetize-button";



/* import ReviewsRow to show list of reviews for the school */
import ReviewsRow from "@/components/ReviewsRow";



import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [q, setQ] = useState("");
  const [phase, setPhase] = useState("all");
  const [radiusKm, setRadiusKm] = useState(25);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [error, setError] = useState("");
  const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 });
  const router = useRouter();

  // const [selectedUrn, setSelectedUrn] = useState(null);

  // // define these too (you reference them currently)
  // const [refreshKey, setRefreshKey] = useState(0);
  // const [reviewing, setReviewing] = useState(false);
  // const user = null; // replace with your auth user

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
      let response;
      let body = {};
      try {
        response = await fetch(`/api/schools?q=${encodeURIComponent(term)}${phaseParam}&limit=5`);
        body = await response.json().catch(() => ({}));
      } catch {
        setError("An error occurred while fetching suggestions.");
        setSuggestionLoading(false);
        return;
      }

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
    <main className="min-h-screen flex flex-col overflow-x-hidden overflow-y-visible">
      <header className="display-headings relative w-full h-[48svh] flex items-center justify-center  bg-brand-blue overflow-x-hidden">
        <IconsScroll
          size={400}
          magnetOffset={magnetOffset}
          colors={["var(--color-brand-orange)", "var(--color-brand-brown)"]}
        />

        <div className="relative z-10 px-6 text-center">
          <h1 className="font-extrabold text-brand-cream dark:text-brand-cream">
            Welcome to <br />
            <span className="text-brand-cream dark:text-brand-cream">EduRater</span>
          </h1>
          <h3 className="text-brand-cream font-semibold z-10 px-6 pt-4 text-center">
            Search, rate and review any school in Britain
          </h3>
          <p className="text-brand-cream pt-5">
              Request a school staff account to see school reviews and unique statistics in your specialist dashboard 
          </p>
        </div>
      </header>

      {/* SEARCH AREA */}

                <div className="display-headings text-brand-brown dark:text-brand-cream text-center">
            <h4 className="pt-12  font-semibold w-full">
              Look up any school name, postcode, city or town below.
            </h4>
            <p className="pt-2 ">You can adjust the range, choose whether you want to search primary, secondary or nursery, or leave blank.</p>
          </div>

      <section className="flex-1 min-h-0 w-full bg-brand-cream dark:bg-brand-brown flex items-start justify-center px-6 ">
        <div className="w-full max-w-lg py-12 pt-8 min-h-0">
          <form
            className="w-full flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
            
          <div className="flex flex-col gap-4 rounded-md border border-brand-brown bg-brand-blue px-4 py-4 dark:bg-brand-cream dark:border-brand-cream">

            {/* ---------- SEARCH BAR + BUTTON ---------- */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for a school, postcode or area..."
                className="w-full sm:flex-1 min-w-0 rounded-md border bg-brand-cream border-brand-brown px-4 py-2 text-brand-blue placeholder:text-brand-brown/50 dark:placeholder:text-brand-orange/50 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:border-brand-orange dark:focus:ring-brand-orange dark:border-brand-cream dark:bg-brand-brown dark:text-brand-orange"
              />
             
             <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-start">
              <MagnetizeButton
                particleCount={14}
                attractRadius={52}
                onMagnet={({ x, y, active }) => {
                  if (!active) {
                    setMagnetOffset({ x: 0, y: 0 });
                    return;
                  }
                  setMagnetOffset({ x: x * 0.12, y: y * 0.12 });
                }}
              >
                <button
                  type="button"
                  onClick={onSearch}
                  className="rounded-md px-6 py-3 bg-brand-brown dark:bg-brand-orange text-brand-cream dark:text-brand-brown font-bold hover:bg-brand-orange dark:hover:bg-brand-orange dark:hover:text-brand-cream focus:outline-none focus:ring-2"
                >
                  Search
                </button>
              </MagnetizeButton>
            </div>
          </div>
            {/* ---------- RANGE + PHASE CONTROLS ---------- */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center min-w-0">
              <div className="text-sm font-semibold whitespace-nowrap text-brand-orange dark:text-brand-brown -mb-4 sm:mb-0">
                Range {radiusKm} km
              </div>

              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full sm:flex-1 min-w-0 custom-range"
              />

              <div className="w-full sm:w-44 border rounded-lg text-brand-brown dark:text-brand-cream bg-brand-cream dark:bg-brand-brown border-brand-orange">
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="All phases" />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-cream dark:bg-brand-brown border border-brand-orange rounded-lg text-brand-brown dark:text-brand-cream">
                    <SelectItem value="all">All phases</SelectItem>
                    <SelectItem value="primary">Primary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="nursery">Nursery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          </div>

              <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mt-10">
                <ReviewsRow
                  mode="recent"
                  limit={10}
                  helpfulThreshold={2}
                  cardVariant="home"
                  showTitle={false}
                />
              </section>
          
          {/* ---------- SUGGESTIONS ---------- */}
            {suggestionLoading && (
              <p className="text-sm text-brand-brown dark:text-brand-cream">
                Loading suggestions...
              </p>
            )}

            {error && (
              <p className="text-sm text-brand-orange">
                {error}
              </p>
            )}

         {suggestions.length > 0 && (
          <div className="bg-brand-brown dark:bg-brand-cream p-4 rounded-md">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.URN}
                type="button"
                onClick={() => setSelectedUrn(suggestion.URN)}
                className="w-full text-left"
              >
                <RecommendationCard school={suggestion} />
              </button>
            ))}
          </div>
        )}
       </form>
      </div>
     </section>
    </main>
   );
  }
