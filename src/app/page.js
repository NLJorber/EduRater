"use client";

/* lets component store and update values */
import { useState, useEffect } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";
import IconsScroll from "@/components/IconsScroll";
import RecommendationCard from "@/components/Recommendation";
import Link from "next/link";
import { MagnetizeButton } from "@/components/ui/magnetize-button";

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
    <main className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden overflow-x-hidden">
      <header className="display-headings relative w-full h-[48svh] flex items-center justify-center  bg-brand-blue overflow-hidden">
        <IconsScroll
          icons={icons}
          size={44}
          rows={7}
          speed={300}
          magnetOffset={magnetOffset}
        />

        <div className="relative z-10 px-6 text-center">
          <h1 className="font-extrabold text-brand-brown dark:text-white">
            Welcome to <br />
            <span className="text-brand-cream dark:text-brand-orange">EduRater</span>
          </h1>
        </div>
      </header>

      {/* SEARCH AREA */}
      <section className="flex-1 min-h-0 w-full bg-brand-cream dark:bg-brand-brown flex items-start justify-center px-6 overflow-y-auto">
        <div className="w-full max-w-lg py-12 min-h-0">
          <form
            className="w-full flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row rounded-md border border-brand-brown px-4 py-2 text-brand-blue bg-brand-cream dark:bg-brand-brown dark:border-brand-cream dark:text-brand-orange ">
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
                className="w-full custom-range"
              />
              <div className="w-full sm:w-44">

              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger
                  className="
                    h-12 min-h-12 w-full
                    rounded-md border border-brand-brown
                    bg-brand-cream dark:bg-brand-brown
                    px-4
                    text-base text-brand-blue dark:text-brand-orange
                    focus:outline-none focus:ring-2 focus:ring-brand-blue
                    dark:border-brand-cream 
                    dark:focus:border-brand-orange dark:focus:ring-brand-orange
                  "
                >
                  <SelectValue placeholder="All phases" />
                </SelectTrigger>

                <SelectContent
                  className="
                    rounded-md border border-brand-brown dark:border-brand-cream
                    bg-brand-cream dark:bg-brand-brown
                  "
                >
                  <SelectItem value="all">All phases</SelectItem>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="nursery">Nursery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}   /* update q state on input change */
                placeholder="Search for schools..."
                className="w-full rounded-md border border-brand-brown px-4 py-2 text-brand-blue placeholder:text-brand-brown focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:border-brand-orange dark:focus:ring-brand-orange bg-brand-cream dark:bg-brand-brown dark:border-brand-cream dark:text-brand-orange dark:placeholder-brand-cream"
              />
              <MagnetizeButton
                particleCount={14}
                attractRadius={52}
                onMagnet={({ x, y, active }) => {
                  if (!active) {
                    setMagnetOffset({ x: 0, y: 0 });
                    return;
                  }
                  setMagnetOffset({
                    x: x * 0.12,
                    y: y * 0.12,
                  });
                }}
              >
                <button
                  type="button"
                  onClick={onSearch}
                  className="self-center rounded-md px-6 py-3 bg-brand-brown dark:bg-brand-cream text-brand-cream dark:text-brand-brown font-bold hover:bg-brand-orange dark:hover:bg-brand-blue hover:text-white dark:hover:text-brand-cream focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </MagnetizeButton>
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
                      className="block focus:outline-none hover:scale-[1.01] transition"
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
