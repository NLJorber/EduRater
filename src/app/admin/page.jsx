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
import AdminActivityChart from "@/components/AdminActivityChart";

export default function AdminDashboardPage() {
  const [session, setSession] = useState(null); // holds current logged in session object or null if logged out
  const [authLoading, setAuthLoading] = useState(true);   // true while checking auth state
  const [dataLoading, setDataLoading] = useState(false);  // true while loading admin dashboard data
  const [rows, setRows] = useState([]);   // table data from school-review-counts API
  const [error, setError] = useState(""); // message to show user if something fails or access is denied
  const [staffRequests, setStaffRequests] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [staffRefresh, setStaffRefresh] = useState(0);

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

  useEffect(() => {
    const loadStaffRequests = async () => {
      if (!session?.access_token) {
        return;
      }

      setStaffLoading(true);
      setStaffError("");

      const res = await fetch("/api/admin/staff-requests?status=pending", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStaffError(body.error || "Failed to load staff requests.");
        setStaffRequests([]);
        setStaffLoading(false);
        return;
      }

      setStaffRequests(body.data ?? []);
      setStaffLoading(false);
    };

    loadStaffRequests();
  }, [session?.access_token, staffRefresh]);

  const handleStaffUpdate = async (id, status, schoolId) => {
    if (!session?.access_token) {
      return;
    }

    setStaffError("");

    const res = await fetch("/api/admin/staff-requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id, status, schoolId }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStaffError(body.error || "Failed to update request.");
      return;
    }

    setStaffRefresh((prev) => prev + 1);
  };

  return (
    <main className="display-headings min-h-screen bg-brand-cream dark:bg-brand-brown text-brand-brown dark:text-brand-cream ">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <h4 className="text-sm uppercase tracking-[0.3em] text-brand-brown dark:text-brand-cream">
            Admin Dashboard
          </h4>
          <h1 className="text-3xl font-semibold">School review overview</h1>
          <p className="text-sm text-brand-brown dark:text-brand-cream">
            Review counts for schools with at least one review.
          </p>
        </div>

        {/* while authLoading is true (session check in progress), show checking access message */}
        {authLoading && (
          <p className="text-sm text-brand-blue">Checking access...</p>
        )}

        {/* while not logged in and not checking auth, show sign in prompt */}
        {!authLoading && !session && (
          <p className="text-sm text-brand-orange">
            Please <Link href="/login">sign in</Link> to continue.
          </p>
        )}

        {/* if not checking auth and logged in, show error message if any */}
        {error && <p className="text-sm text-brand-orange">{error}</p>}
        
        {/* if logged in and no error, show the admin dashboard content */}
        {!authLoading && session && !error && (
          <AdminActivityChart accessToken={session.access_token} />
        )}

        {!authLoading && session && !error && (
          <div className="rounded-3xl border border-brand-blue bg-brand-blue p-6">

            {/* 
              if dataLoading true, show loading message
              else if no rows, show no data message
              else show the data table
            */}
            {dataLoading ? (
              <p className="text-sm text-brand-cream">Loading review counts...</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-brand-cream">
                No schools have reviews yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-brand-orange">
                  <thead>
                    <tr className="border-b border-brand-cream text-xs uppercase tracking-wide text-brand-cream">
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
                        className="border-b border-brand-cream last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          <Link
                            href={`/schools/${row.school_urn}`}
                            className="inline-flex items-center gap-2 text-brand-cream hover:text-brand-orange"
                          >
                            {row.school_name}
                          </Link>
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

        {!authLoading && session && !error && (
          <div className="rounded-3xl border border-brand-orange bg-brand-orange p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg text-brand-brown font-semibold">Staff requests</h2>
                <p className="text-sm font-medium mt-1 text-brand-brown">
                  Review pending staff access requests:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStaffRefresh((prev) => prev + 1)}
                className="rounded-md border border-brand-cream hover:border-brand-blue bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-brown hover:text-brand-cream hover:bg-brand-blue"
              >
                Refresh
              </button>
            </div>

            {staffError ? (
              <p className="mt-4 text-sm text-red-600">{staffError}</p>
            ) : null}

            {staffLoading ? (
              <p className="mt-6 text-sm text-brand-blue">
                Loading staff requests...
              </p>
            ) : staffRequests.length === 0 ? (
              <p className="mt-5 text-sm font-medium text-brand-white">
                No pending staff requests.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {staffRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1 text-sm text-slate-700">
                        <p className="font-semibold">{request.full_name}</p>
                        <p>{request.position}</p>
                        <p className="text-slate-500">
                          {request.school_email || "No email provided"}
                        </p>
                        <p className="text-slate-500">
                          School:{" "}
                          {request.schools?.name ?? request.school_id}
                          {request.schools?.domain
                            ? ` (${request.schools.domain})`
                            : ""}
                        </p>
                        <p className="text-xs text-slate-400">
                          Submitted:{" "}
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleStaffUpdate(request.id, "approved")
                          }
                          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStaffUpdate(request.id, "rejected")
                          }
                          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    {request.evidence ? (
                      <p className="mt-3 text-sm text-slate-600">
                        Evidence: {request.evidence}
                      </p>
                    ) : null}
                    {!request.user_id ? (
                      <p className="mt-2 text-xs text-amber-600">
                        Guest request (no linked account).
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
