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
    <div className="display-headings flex min-h-screen items-center justify-center bg-brand-azure font-sans dark:bg-brand-darkblue">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-56 px-16 bg-brand-red dark:bg-brand-darkgreen sm:items-start">
        <h1 className="font-extrabold leading-tight text-white dark:text-white">
          Welcome to <br />
          <span className="text-brand-custard">EduRater</span>
        </h1>
        
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}   /* update q state on input change */
          placeholder="Search for schools..."
          className="w-full rounded-md border border-brand-custard px-4 py-2 text-brand-white placeholder:text-brand-custard focus:border-brand-custard focus:outline-none focus:ring-2 focus:ring-brand-custard bg-brand-azure dark:bg-brand-darkblue dark:border-brand-midgrey dark:placeholder-brand-lightgrey"
        />

        <button
          type="button"
          onClick={onSearch}    /* call onSearch when button is clicked */
          className="mt-4 rounded-md px-6 py-3 bg-brand-custard dark:bg-brand-darkblue  text-brand-azure dark:text-brand-custard font-bold hover:bg-brand-minty dark:hover:bg-brand-custard hover:text-white dark:hover:text-brand-darkblue focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </main>
    </div>
  );
}
