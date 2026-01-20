"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setSession(null);
        setAuthLoading(false);
        return;
      }

      setSession(data.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) {
          return;
        }
        setSession(nextSession ?? null);
      }
    );

    return () => {
      active = false;
      subscription.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      if (!session?.access_token) {
        return;
      }

      setDataLoading(true);
      setError("");

      const res = await fetch("/api/admin/school-review-counts", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const body = await res.json().catch(() => ({}));

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

      setRows(body.data ?? []);
      setDataLoading(false);
    };

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

        {authLoading && (
          <p className="text-sm text-slate-600">Checking access...</p>
        )}

        {!authLoading && !session && (
          <p className="text-sm text-slate-600">
            Please <Link href="/login">sign in</Link> to continue.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!authLoading && session && !error && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
                    {rows.map((row) => (
                      <tr
                        key={row.school_urn}
                        className="border-b border-slate-200 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {row.school_name}
                        </td>
                        <td className="py-3 pr-4">{row.school_urn}</td>
                        <td className="py-3 text-right">
                          {row.review_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
