"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

const getRedirectUrl = () =>
  `${window.location.origin.replace(/\/$/, "")}/auth/callback`;

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

    const normalizedEmail = email.trim();
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
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

    const normalizedEmail = email.trim();
    const { error } = await supabaseClient.auth.signUp({
      email: normalizedEmail,
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
    <main className="display-headings min-h-screen bg-brand-blue dark:bg-brand-brown text-brand-white dark:text-brand-custard">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-2 py-45">
        <div>
          <h2 className="font-extrabold text-brand-cream dark:text-brand-cream">
          Welcome to <br />
          <span className="text-brand-brown dark:text-brand-orange ">EduRater</span>
        </h2>
          <h3 className="text-brand-cream dark:text-brand-cream text-3xl font-semibold mt-10 mb-4">Sign in or create an account to make reviews!</h3>
          <p className="text-sm text-brand-cream">
            Use Google or email/password. Email signups require verification.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="rounded-full border border-brand-cream hover:border-brand-brown dark:border-brand-cream dark:hover:border-brand-orange bg-brand-cream dark:bg-brand-cream hover:bg-brand-brown dark:hover:bg-brand-orange px-4 py-3 text-sm text-brand-brown dark:text-brand-blue  hover:text-brand-cream dark:hover:text-brand-cream font-semibold transition"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-brand-cream">
          <span className="h-px flex-1 bg-brand-cream" />
          or
          <span className="h-px flex-1 bg-brand-cream" />
        </div>

        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <label className="block text-sm font-bold text-brand-cream dark:text-brand-orange">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-cream px-4 py-3 text-sm placeholder:text-brand-lightgrey dark:placeholder:text-brand-midgrey dark:focus:border-brand-cream focus:outline-none"
              placeholder="you@school.edu"
            />
          </label>
          <label className="block text-sm font-bold text-brand-cream dark:text-brand-orange">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-lightgrey px-4 py-3 text-sm placeholder:text-brand-lightgrey dark:placeholder:text-brand-midgrey dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="At least 8 characters"
            />
          </label>
          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-xs font-semibold text-brand-cream hover:text-brand-blue"
            >
              Forgot password?
            </a>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="flex-1 rounded-full  px-4 py-3 text-sm font-semibold text-brand-cream dark:text-brand-cream transition hover:text-brand-cream dark:hover:text-brand-cream bg-brand-orange dark:bg-brand-orange hover:bg-brand-brown"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={handleEmailSignUp}
              className="flex-1 rounded-full border bg-brand-cream dark:bg-brand-cream border-brand-cream  dark:border-brand-cream  text-brand-brown dark:text-brand-blue hover:text-brand-cream dark:hover:text-brand-cream px-4 py-3 text-sm font-semibold transition hover:border-brand-brown dark:hover:border-brand-orange hover:bg-brand-brown dark:hover:bg-brand-orange"
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
