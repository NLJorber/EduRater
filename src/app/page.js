"use client";

/* lets component store and update values */
import { useState } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";
import IconsScroll from "@/components/IconsScroll";

export default function Home() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const onSearch = () => {
    const term = q.trim();
    if (!term) return;

    /* navigate to the schools page with the query as a query parameter */
    router.push(`/schools?q=${encodeURIComponent(term)}`)
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
      </section>
    </main>
  );
}
