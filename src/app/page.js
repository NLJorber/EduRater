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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-5xl font-extrabold leading-tight text-black dark:text-white sm:text-6xl">
          Welcome to <br />
          <span className="text-blue-600">EduRater</span>
        </h1>
        
        <input
          type="text"
          value={town}
          onChange={(e) => setTown(e.target.value)}   /* update town state on input change */
          placeholder="Search for schools..."
          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />

        <button
          type="button"
          onClick={onSearch}    /* call onSearch when button is clicked */
          className="mt-4 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </main>
    </div>
  );
}
