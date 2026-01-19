"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

const getResetRedirectUrl = () =>
  `${window.location.origin.replace(/\/$/, "")}/reset-password`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const setError = (message) =>
    setStatus({ type: "error", message: message ?? "Something went wrong." });
  const setMessage = (message) => setStatus({ type: "info", message });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "loading", message: "Sending reset link..." });

    const normalizedEmail = email.trim();
    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: getResetRedirectUrl(),
      }
    );

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Check your email for a password reset link.");
  };

  return (
    <main className="min-h-screen bg-brand-azure dark:bg-brand-darkgreen text-brand-white dark:text-brand-custard">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-24">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Reset password</h1>
          <p className="mt-3 text-sm text-brand-white">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-bold text-brand-custard">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-lightgrey px-4 py-3 text-sm dark:placeholder:text-brand-midgrey dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="you@school.edu"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full px-4 py-3 text-sm font-semibold text-brand-white dark:text-brand-custard transition hover:text-brand-azure dark:hover:text-brand-darkblue bg-brand-minty dark:bg-brand-darkblue hover:bg-brand-custard"
          >
            Send reset link
          </button>
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

        <a
          href="/login"
          className="text-sm font-semibold text-brand-custard hover:text-brand-minty"
        >
          Back to sign in
        </a>
      </div>
    </main>
  );
}
