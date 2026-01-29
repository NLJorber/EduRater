"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function StaffRequestPage() {
  const { session, profile, loading: authLoading } = useAuthProfile();
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [evidence, setEvidence] = useState("");
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const canRequest = !["staff_verified", "super_admin"].includes(
    profile?.role
  );

  const setError = useCallback(
    (message) =>
      setStatus({ type: "error", message: message ?? "Something went wrong." }),
    []
  );
  const setMessage = useCallback(
    (message) => setStatus({ type: "info", message }),
    []
  );

  const loadSchools = useCallback(async () => {
    const { data, error } = await supabaseClient
      .from("schools")
      .select("id, name, domain")
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
      return;
    }

    setSchools(data ?? []);
  }, [setError]);

  const loadRequests = useCallback(
    async (accessToken) => {
    if (!accessToken) {
      setRequests([]);
      return;
    }

    const response = await fetch("/api/staff-requests", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error || "Failed to load requests.");
      return;
    }

    setRequests(body.data ?? []);
    },
    [setError]
  );

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }
    loadRequests(session.access_token);
  }, [loadRequests, session?.access_token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!session?.access_token) {
      setError("Please sign in to request staff access.");
      return;
    }
    if (!schoolId) {
      setError("Please choose a school.");
      return;
    }
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!position.trim()) {
      setError("Please enter your position.");
      return;
    }

    setStatus({ type: "loading", message: "Submitting request..." });

    const response = await fetch("/api/staff-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        schoolId,
        fullName,
        position,
        schoolEmail,
        evidence,
      }),
    });
    const body = await response.json();

    if (!response.ok) {
      setError(body.error || "Request failed.");
      return;
    }

    setMessage("Request submitted. We will review it shortly.");
    setEvidence("");
    setSchoolId("");
    setFullName("");
    setPosition("");
    setSchoolEmail("");
    loadRequests(session.access_token);
  };

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === schoolId),
    [schools, schoolId]
  );

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Staff Request
          </p>
          <h1 className="text-3xl font-semibold">Request staff access</h1>
          <p className="text-sm text-slate-600">
            Use your school email when possible. We auto-approve matching
            domains.
          </p>
        </div>

        {!canRequest ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm text-slate-700">
                Your account already has staff access.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  School
                  <select
                    value={schoolId}
                    onChange={(event) => setSchoolId(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                  >
                    <option value="">Select a school</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                        {school.domain ? ` (${school.domain})` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedSchool?.domain ? (
                  <p className="text-xs text-slate-500">
                    Auto-approve domain: {selectedSchool.domain}
                  </p>
                ) : null}

                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Willy Wonka"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Position
                  <input
                    type="text"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Teacher, Head of Department, etc."
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  School email (optional)
                  <input
                    type="email"
                    value={schoolEmail}
                    onChange={(event) => setSchoolEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="you@school.edu"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Evidence (optional)
                  <textarea
                    value={evidence}
                    onChange={(event) => setEvidence(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Share any proof that you work at this school."
                  />
                </label>
              </div>

              {!session ? (
                <p className="mt-4 text-xs text-slate-600">
                  Please sign in to submit a staff request.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status.type === "loading" || !session}
                className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Submit request
              </button>
            </form>
          )}

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-red-600" : "text-slate-600"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        {!authLoading && session ? (
          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Your requests</h2>
            {requests.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">
                No staff requests yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {requests.map((request) => (
                  <li key={request.id} className="rounded-2xl bg-slate-50 p-4">
                    <p>
                      Status:{" "}
                      <span className="font-semibold">{request.status}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted:{" "}
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
