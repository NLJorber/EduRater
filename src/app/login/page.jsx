"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

const getRedirectUrl = () =>
  `${window.location.origin.replace(/\/$/, "")}/auth/callback`;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("sign-in");
  const [displayName, setDisplayName] = useState("");
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

  const handleEmailSignUp = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Creating account..." });

    const normalizedEmail = email.trim();
    const normalizedName = displayName.trim();

    if (!normalizedName) {
      setError("Please enter a display name.");
      return;
    }

    const { error } = await supabaseClient.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: {
          display_name: normalizedName,
        },
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "If the email can be registered, we sent a verification link. If you already have an account, sign in or reset your password."
    );
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
    <main className="display-headings min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-2">
        <div>
          <h2 className="font-extrabold text-brand-brown dark:text-brand-cream">
          Welcome to <br />
          <span className="text-brand-brown dark:text-brand-orange ">EduRater</span>
        </h2>
          <h3 className="text-brand-brown dark:text-brand-cream text-3xl font-semibold mt-10 mb-4">
            {mode === "sign-in"
              ? "Sign in to continue"
              : "Create your account"}
          </h3>
          <p className="text-sm text-brand-brown dark:text-brand-cream">
            Use Google or email/password. Email signups require verification.
          </p>
        </div>

        {mode === "sign-in" ? (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="rounded-full border border-brand-orange hover:border-brand-brown dark:border-brand-blue dark:hover:border-brand-orange bg-brand-orange dark:bg-brand-blue hover:bg-brand-brown dark:hover:bg-brand-orange px-4 py-3 text-sm text-brand-brown dark:text-brand-cream  hover:text-brand-cream dark:hover:text-brand-brown font-semibold transition"
          >
            Continue with Google
          </button>
        ) : null}

        {mode === "sign-in" ? (
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-brand-brown dark:text-brand-cream">
            <span className="h-px flex-1 bg-brand-orange dark:bg-brand-blue" />
            or
            <span className="h-px flex-1 bg-brand-orange dark:bg-brand-blue" />
          </div>
        ) : null}

        {mode === "sign-in" ? (
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange ">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-brand-brown/50 bg-brand-cream
                focus:bg-brand-cream dark:border-brand-cream  px-4 py-3 text-sm text-brand-brown dark:text-brand-brown placeholder:text-brand-orange dark:placeholder:text-brand-orange dark:focus:border-brand-orange focus:outline-none"
                placeholder="you@school.edu"
              />
            </label>
            <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
              Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-brand-brown/50 bg-brand-cream 
                focus:bg-brand-cream dark:border-brand-cream px-4 py-3 text-sm text-brand-brown dark:text-brand-brown placeholder:text-brand-orange dark:placeholder:text-brand-orange dark:focus:border-brand-orange focus:outline-none"
                placeholder="At least 8 characters"
              />
            </label>
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-xs font-semibold text-brand-brown dark:text-brand-orange  hover:text-brand-blue dark:hover:text-brand-blue"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-full px-4 py-3 text-sm font-semibold text-brand-cream dark:text-brand-brown transition hover:text-brand-brown dark:hover:text-brand-cream bg-brand-blue dark:bg-brand-orange dark:hover:bg-brand-blue hover:bg-brand-orange"
            >
              Sign in
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleEmailSignUp}>
            <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
              Name
              <input
                type="text"
                required
                maxLength={40}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-brand-orange bg-brand-cream  dark:border-brand-cream px-4 py-3 text-sm placeholder:text-brand-orange dark:placeholder:text-brand-orange dark:focus:border-brand-cream focus:outline-none"
                placeholder="Your display name"
              />
            </label>
            <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border bg-brand-cream border-brand-orange dark:border-brand-cream px-4 py-3 text-sm placeholder:text-brand-orange dark:placeholder:text-brand-orange dark:focus:border-brand-cream focus:outline-none"
                placeholder="you@school.edu"
              />
            </label>
            <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
              Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border bg-brand-cream border-brand-orange dark:border-brand-orange px-4 py-3 text-sm placeholder:text-brand-orange dark:placeholder:text-brand-orange dark:focus:border-brand-orange focus:outline-none"
                placeholder="At least 8 characters"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full border bg-brand-brown dark:bg-brand-cream border-brand-cream  dark:border-brand-cream  text-brand-cream dark:text-brand-blue hover:text-brand-brown dark:hover:text-brand-cream px-4 py-3 text-sm font-semibold transition hover:border-brand-orange dark:hover:border-brand-orange hover:bg-brand-orange dark:hover:bg-brand-orange"
            >
              Sign up
            </button>
          </form>
        )}

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-brand-blue" : "text-brand-brown"
            }`}
          >
            {status.message}
          </p>
        ) : null}

      
        <div className="text-center text-sm ">
          {mode === "sign-in" ? (
            <button
              type="button"
              onClick={() => {
                setStatus({ type: "idle", message: "" });
                setMode("sign-up");
              }}
              className="font-semibold text-brand-brown dark:text-brand-orange hover:text-brand-blue dark:hover:text-brand-blue"
            >
              No account? Sign up!
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStatus({ type: "idle", message: "" });
                setMode("sign-in");
              }}
              className="font-semibold text-brand-brown dark:text-brand-orange hover:text-brand-orange dark:hover:text-brand-blue"
            >
              Have an account? Sign in!
            </button>
          )}
        </div>

        <div className="text-center text-sm text-brand-brown dark:text-brand-cream">
          <p>Teacher or school staff?</p>
          <a
            href="/staff-request"
            className="mt-2 inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold text-brand-cream hover:text-brand-brown transition bg-brand-blue hover:bg-brand-orange hover:border-brand-orange dark:hover:border-brand-orange dark:hover:text-brand-brown dark:hover:bg-brand-orange"
          >
            Request staff access
          </a>
        </div>
        </div>
  
    </main>
  );
}
