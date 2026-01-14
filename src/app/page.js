"use client";

/* lets component store and update values */
import { useState } from "react";

/* lets component navigate to different pages without a page reload */
import { useRouter } from "next/navigation";

export default function Home() {
  const [town, setTown] = useState("");
  const router = useRouter();

  const onSearch = () => {
    const t = town.trim();
    if (!t) return;

    /* navigate to the schools page with the town as a query parameter */
    router.push(`/schools?town=${encodeURIComponent(t)}`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-1 font-sans dark:bg-brand-2">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-56 px-16 bg-brand-4 dark:bg-brand-2 sm:items-start">
        <h1 className="text-5xl font-extrabold leading-tight text-white dark:text-white sm:text-6xl">
          Welcome to <br />
          <span className="text-brand-3">EduRater</span>
        </h1>
        
        <input
          type="text"
          value={town}
          onChange={(e) => setTown(e.target.value)}   /* update town state on input change */
          placeholder="Search for schools..."
          className="w-full rounded-md border border-brand-3 px-4 py-2 placeholder:text-brand-3 focus:border-brand-5 focus:outline-none focus:ring-2 focus:ring-brand-3 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />

        <button
          type="button"
          onClick={onSearch}    /* call onSearch when button is clicked */
          className="mt-4 rounded-md bg-brand-3 px-6 py-3 text-brand-2 font-bold hover:bg-brand-5 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </main>
    </div>
  );
}
