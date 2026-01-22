/*
  ADMIN DASHBOARD PAGE

  - while checking login state, shows "checking access" message
  - if not logged in, shows sign in prompt
  - if logged in but not admin, shows access denied message
  - if admin, fetches and shows school review counts table
  - if admin, shows reported reviews component
*/

"use client"; // indicates this is a client-side component

import Link from "next/link"; // lets you navigate between pages without full reloads

// useState stores page state (session, loading flags, rows, errors)
// useEffect runs side-effects after render (check session, fetch admin data)
import { useEffect, useState } from "react";

import { supabaseClient } from "@/lib/supabase/client"; // browser-side Supabase client (auth + DB calls)

import ReportedReviewsRow from "@/components/ReportedReviewsRow"; // component to show reported reviews

export default function AdminDashboardPage() {
  const [session, setSession] = useState(null); // holds current logged in session object or null if logged out
  const [authLoading, setAuthLoading] = useState(true);   // true while checking auth state
  const [dataLoading, setDataLoading] = useState(false);  // true while loading admin dashboard data
  const [rows, setRows] = useState([]);   // table data from school-review-counts API
  const [error, setError] = useState(""); // message to show user if something fails or access is denied

  useEffect(() => {
    let active = true;

    // asks Supabase "what is the current session?"
    const loadSession = async () => {
      const { data, error: sessionError } =
        await supabaseClient.auth.getSession(); // getSession() returns { data: { session }, error }

      // prevents state updataes if component unmounted before the async call finished
      if (!active) {
        return;
      }

      // if session lookup fails, show the error, set session to null, stop checking access loading state
      if (sessionError) {
        setError(sessionError.message);
        setSession(null);
        setAuthLoading(false);
        return;
      }

      // save session (or null) and mark auth check as complete
      setSession(data.session ?? null);
      setAuthLoading(false);
    };

    // runs the session checking function
    loadSession();

    // listens for sign in / sign out events to update session state automatically
    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) {
          return;
        }
        setSession(nextSession ?? null);
      }
    );

    // turns off listener and prevents state updates if compoint unmounts
    return () => {
      active = false;
      subscription.subscription?.unsubscribe();
    };
  }, []);

  // fetch admin review counts (only when you have a token) prevents calling admin APIs while logged out
  useEffect(() => {
    const loadCounts = async () => {
      if (!session?.access_token) {
        return;
      }

      // shows loading state for table and clears previous errors
      setDataLoading(true); 
      setError("");

      /*
        sends GET request to admin endpoint with access token as a Bearer token
        so the server can authenticate the user and check if they are an admin
        then run the query/RPC
      */
      const res = await fetch("/api/admin/school-review-counts", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // parses JSON response body from the API
      const body = await res.json().catch(() => ({}));

      // handle error responses
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please sign in to access the admin dashboard.");
        } else if (res.status === 403) {
          setError("You do not have access to this dashboard.");
        } else {
          setError(body.error || "Failed to load dashboard data.");
        }
        setRows([]);
        setDataLoading(false);
        return;
      }

      // on success, save the rows and turn off loading state
      setRows(body.data ?? []);
      setDataLoading(false);
    };

    // runs the loadCounts function
    loadCounts();
  }, [session?.access_token]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-semibold">School review overview</h1>
          <p className="text-sm text-slate-600">
            Review counts for schools with at least one review.
          </p>
        </div>

        {/* while authLoading is true (session check in progress), show checking access message */}
        {authLoading && (
          <p className="text-sm text-slate-600">Checking access...</p>
        )}

        {/* while not logged in and not checking auth, show sign in prompt */}
        {!authLoading && !session && (
          <p className="text-sm text-slate-600">
            Please <Link href="/login">sign in</Link> to continue.
          </p>
        )}

        {/* if not checking auth and logged in, show error message if any */}
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {/* if logged in and no error, show the admin dashboard content */}
        {!authLoading && session && !error && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

            {/* 
              if dataLoading true, show loading message
              else if no rows, show no data message
              else show the data table
            */}
            {dataLoading ? (
              <p className="text-sm text-slate-600">Loading review counts...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-slate-600">
                No schools have reviews yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-3 pr-4">School</th>
                      <th className="py-3 pr-4">URN</th>
                      <th className="py-3 text-right">Reviews</th>
                    </tr>
                  </thead>
                  <tbody>

                    {/* map each row of the array returned by the API to a table row */}
                    {rows.map((row) => (
                      <tr
                        key={row.school_urn}
                        className="border-b border-slate-200 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {row.school_name}
                        </td>
                        <td className="py-3 pr-4">
                          {row.school_urn}
                        </td>
                        <td className="py-3 text-right">
                          {row.review_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* mounts reported reviews component underneath the counts table */}
            <ReportedReviewsRow />
          </div>
        )}
      </div>
    </main>
  );
}
