"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function StaffRequestPage() {
  const { session, profile, loading: authLoading } = useAuthProfile();
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [schoolsError, setSchoolsError] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
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

  const searchSchools = useCallback(
    async (query) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setSchools([]);
        setSchoolsLoading(false);
        return;
      }

      setSchoolsLoading(true);
      setSchoolsError("");

      const escaped = trimmed.replace(/[%_]/g, "\\$&");
      const pattern = `%${escaped}%`;
      const { data, error } = await supabaseClient
        .from("schools")
        .select("id, name, domain")
        .or(`name.ilike.${pattern},domain.ilike.${pattern}`)
        .order("name", { ascending: true })
        .limit(50);

      if (error) {
        setError(error.message);
        setSchoolsError(error.message || "Failed to load schools.");
        setSchools([]);
        setSchoolsLoading(false);
        return;
      }

      setSchools(data ?? []);
      setSchoolsLoading(false);
    },
    [setError]
  );

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
    const trimmed = schoolQuery.trim();
    if (!trimmed) {
      setSchools([]);
      setSchoolsLoading(false);
      return;
    }

    const handle = setTimeout(() => {
      searchSchools(trimmed);
    }, 250);

    return () => clearTimeout(handle);
  }, [schoolQuery, searchSchools]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }
    loadRequests(session.access_token);
  }, [loadRequests, session?.access_token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

    const headers = {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    };

    const response = await fetch("/api/staff-requests", {
      method: "POST",
      headers,
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
    if (session?.access_token) {
      loadRequests(session.access_token);
    }
  };

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === schoolId),
    [schools, schoolId]
  );

  const filteredSchools = useMemo(() => schools, [schools]);

  return (
    <main className="display-headings min-h-screen bg-brand-cream dark:bg-brand-brown text-brand-blue dark:text-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          
          <h2 className=" font-semibold mt-10">Request staff access</h2>
          <h5 className="text-brand-brown">
            Use your school email when possible. We auto-approve matching
            domains.
          </h5>
        </div>

        {!canRequest ? (
            <div className="rounded-3xl border border-brand-brown bg-slate-50 p-6">
              <p className="text-sm text-slate-700">
                Your account already has staff access.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-brand-brown bg-brand-cream p-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-medium text-brand-brown">
                  School
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={schoolQuery}
                      onChange={(event) => {
                        setSchoolQuery(event.target.value);
                        setSchoolId("");
                        setIsSchoolMenuOpen(true);
                      }}
                      onFocus={() => setIsSchoolMenuOpen(true)}
                      onBlur={() =>
                        setTimeout(() => setIsSchoolMenuOpen(false), 150)
                      }
                      className="w-full rounded-2xl border border-brand-brown px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
                      placeholder="Search by school name or domain"
                      aria-label="Search schools"
                      role="combobox"
                      aria-expanded={isSchoolMenuOpen}
                      aria-controls="school-search-options"
                    />

                    {isSchoolMenuOpen ? (
                      <div
                        id="school-search-options"
                        className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-brand-brown bg-brand-orange shadow-lg"
                      >
                        {schoolsLoading ? (
                          <div className="px-4 py-3 text-sm text-brand-blue">
                            Loading schools...
                          </div>
                        ) : schoolsError ? (
                          <div className="px-4 py-3 text-sm text-brand-orange">
                            {schoolsError}
                          </div>
                        ) : schoolQuery.trim() === "" ? (
                          <div className="px-4 py-3 text-sm text-brand-brown">
                            Start typing to search for your school.
                          </div>
                        ) : filteredSchools.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-brand-brown">
                            No schools found. Try a different search.
                          </div>
                        ) : (
                          filteredSchools.map((school) => (
                            <button
                              key={school.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setSchoolId(school.id);
                                setSchoolQuery(
                                  `${school.name}${school.domain ? ` (${school.domain})` : ""}`
                                );
                                setIsSchoolMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-brand-brown hover:bg-brand-blue"
                            >
                              {school.name}
                              {school.domain ? ` (${school.domain})` : ""}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </label>

                {!schoolsLoading && !schoolsError && schools.length === 0 ? (
                  <p className="text-xs text-brand-orange">
                    No schools are available yet. An admin needs to load schools
                    into the database.
                  </p>
                ) : null}

                {schoolId && selectedSchool ? (
                  <p className="text-xs text-brand-brown">
                    Selected: {selectedSchool.name}
                    {selectedSchool.domain ? ` (${selectedSchool.domain})` : ""}
                  </p>
                ) : null}

                {selectedSchool?.domain ? (
                  <p className="text-xs text-brand-brown">
                    Auto-approve domain: {selectedSchool.domain}
                  </p>
                ) : null}

                <label className="block text-sm font-medium text-brand-brown">
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-brown px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
                    placeholder="Willy Wonka"
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-brand-brown">
                  Position
                  <input
                    type="text"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-brown px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
                    placeholder="Teacher, Head of Department, etc."
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-brand-brown">
                  School email {!session ? "(required)" : "(optional)"}
                  <input
                    type="email"
                    value={schoolEmail}
                    onChange={(event) => setSchoolEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-brand-brown px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
                    placeholder="you@school.edu"
                    required={!session}
                  />
                </label>

                <label className="block text-sm font-medium text-brand-brown">
                  Evidence (optional)
                  <textarea
                    value={evidence}
                    onChange={(event) => setEvidence(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-brand-brown px-4 py-3 text-sm focus:border-brand-blue focus:outline-none"
                    placeholder="Share any proof that you work at this school."
                  />
                </label>
              </div>

              {!session ? (
                <p className="mt-4 text-xs text-brand-orange">
                  You can submit without an account, but we need a school email
                  to contact you.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status.type === "loading"}
                className="mt-6 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange disabled:cursor-not-allowed disabled:opacity-70"
              >
                Submit request
              </button>
            </form>
          )}

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-brand-orange" : "text-brand-blue"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        {!authLoading && session ? (
          <div className="rounded-3xl border border-brand-brown dark:border-brand-cream p-6">
            <h2 className="text-lg font-semibold">Your requests</h2>
            {requests.length === 0 ? (
              <p className="mt-2 text-sm text-brand-brown dark:text-brand-cream">
                No staff requests yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-brand-cream">
                {requests.map((request) => (
                  <li key={request.id} className="rounded-2xl bg-brand-blue p-4">
                    <p>
                      Status:{" "}
                      <span className="font-semibold">{request.status}</span>
                    </p>
                    <p className="text-xs text-brand-cream">
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
