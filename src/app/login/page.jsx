"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

const getRedirectUrl = () =>
  `${window.location.origin.replace(/\\/$/, "")}/auth/callback`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const setError = (message) =>
    setStatus({ type: "error", message: message ?? "Something went wrong." });
  const setMessage = (message) => setStatus({ type: "info", message });

  const handleEmailSignIn = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Signing in..." });

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/");
  };

  const handleEmailSignUp = async () => {
    setStatus({ type: "loading", message: "Creating account..." });

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Check your email to verify your account.");
  };

  const handleGoogleSignIn = async () => {
    setStatus({ type: "loading", message: "Redirecting to Google..." });

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getRedirectUrl(),
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            EduRater
          </p>
          <h1 className="text-3xl font-semibold">Sign in or create an account</h1>
          <p className="text-sm text-slate-600">
            Use Google or email/password. Email signups require verification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-slate-400"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="you@school.edu"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-400 focus:outline-none"
              placeholder="At least 8 characters"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="flex-1 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleEmailSignUp}
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-slate-400"
            >
              Sign up
            </button>
          </div>
        </form>

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-red-600" : "text-slate-600"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
