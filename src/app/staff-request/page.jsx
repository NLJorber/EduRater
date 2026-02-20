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
    <main className="display-headings min-h-screen text-brand-brown dark:text-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          
          <h2 className=" font-bold mt-10">Request staff access</h2>
          <h4 className="font-bold text-brand-brown dark:text-brand-cream pt-8">
            Use your school email where possible. We auto-approve matching
            domains.
          </h4>
        </div>

        {!canRequest ? (
            <div className="rounded-3xl border border-brand-brown/50 bg-brand-orange p-6">
              <p className="text-sm text-brand-blue/50">
                Your account already has staff access.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-brand-brown/50 bg-brand-cream p-6"
            >
              <div className="space-y-4">
                <label className="block text-sm font-bold text-brand-brown">
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
                      className="w-full rounded-2xl px-4 py-3 text-sm border font-medium border-brand-brown/50 bg-brand-cream placeholder:text-brand-orange placeholder:opacity-100  focus:border-brand-blue/50 focus:outline-none"
                      placeholder="Search by school name or domain"
                      aria-label="Search schools"
                      role="combobox"
                      aria-expanded={isSchoolMenuOpen}
                      aria-controls="school-search-options"
                    />

                    {isSchoolMenuOpen ? (
                      <div
                        id="school-search-options"
                        className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border  border-brand-orange bg-brand-cream shadow-lg"
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
                          <div className="px-4 py-3 text-sm font-light text-brand-brown">
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
                              className="w-full px-4 py-3 text-left text-sm text-brand-brown hover:bg-brand-orange"
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
                  <p className="text-xs text-brand-blue/50">
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

                <label className="block text-sm font-bold text-brand-brown">
                  Full name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border font-medium bg-brand-cream placeholder:text-brand-orange placeholder:opacity-100 border-brand-brown/50 px-4 py-3 text-sm focus:border-brand-blue/50 focus:outline-none"
                    placeholder="Mrs Smith"
                    required
                  />
                </label>

                <label className="block text-sm font-bold text-brand-brown">
                  Position
                  <input
                    type="text"
                    value={position}
                    onChange={(event) => setPosition(event.target.value)}
                    className="mt-2 w-full rounded-2xl border font-medium border-brand-brown/50 px-4 py-3 text-sm focus:border-brand-blue/50 bg-brand-cream placeholder:text-brand-orange placeholder:opacity-100 focus:outline-none"
                    placeholder="Teacher, Head of Department, etc."
                    required
                  />
                </label>

                <label className="block text-sm font-bold text-brand-brown">
                  School email {!session ? "(required)" : "(optional)"}
                  <input
                    type="Email"
                    value={schoolEmail}
                    onChange={(event) => setSchoolEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border font-medium border-brand-brown/50 px-4 py-3 text-sm focus:border-brand-blue/50 bg-brand-cream placeholder:text-brand-orange placeholder:opacity-100 focus:outline-none"
                    placeholder="you@school.edu"
                    required={!session}
                  />
                </label>

                <label className="block text-sm font-bold text-brand-brown">
                  Evidence (optional)
                  <textarea
                    value={evidence}
                    onChange={(event) => setEvidence(event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border font-medium border-brand-brown/50 px-4 py-3 text-sm focus:border-brand-blue/50 bg-brand-cream  placeholder:text-brand-orange placeholder:opacity-100 focus:outline-none"
                    placeholder="Share any proof that you work at this school."
                  />
                </label>
              </div>

              {!session ? (
                <p className="mt-4 text-xs text-brand-blue/50">
                  You can submit without an account, but we will need a school email
                  to contact you.
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status.type === "loading"}
                className="mt-6 rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-brown transition hover:bg-brand-blue hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-70"
              >
                Submit request
              </button>
            </form>
          )}

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-brand-blue" : "text-brand-brown/50"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        {!authLoading && session ? (
          <div className="display-headings rounded-3xl border border-brand-brown/50 dark:border-brand-cream p-6">
            <h4 className="font-bold text-brand-brown dark:text-brand-cream">Your requests:</h4>
            {requests.length === 0 ? (
              <p className="mt-2 text-sm text-brand-brown dark:text-brand-cream">
                No staff requests yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-m font-medium text-brand-brown">
                {requests.map((request) => (
                  <li key={request.id} className="rounded-2xl bg-brand-orange pt-4 pb-4 pl-6 py-4">
                    <p>
                      Status:{" "}
                      <span className="font-semibold pl-2">{request.status}</span>
                    </p>
                    <p className="text-brand-brown pt-2">
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
