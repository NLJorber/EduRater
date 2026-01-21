"use client";

/* lets component store and update values */
import { useState } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";

export default function Home() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSearch = () => {
    const term = q.trim();
    if (!term) return;

    /* navigate to the schools page with the query as a query parameter */
    router.push(`/schools?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="display-headings flex min-h-screen items-center justify-center bg-brand-cream font-sans dark:bg-brand-brown">
      <main className="display-headings flex min-h-screen w-full max-w-3xl flex-col items-center gap-14 py-62 px-16 bg-brand-cream dark:bg-brand-brown sm:items-start">
        <h1 className="font-extrabold text-brand-blue dark:text-white">
          Welcome to <br />
          <span className="text-brand-brown dark:text-brand-orange ">EduRater</span>
        </h1>
        
        <div className="w-full flex flex-col gap-3">
          <form
            className="w-full flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch();
            }}
          >
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
          </form>
        </div>
      </main>
    </div>
  );
}
