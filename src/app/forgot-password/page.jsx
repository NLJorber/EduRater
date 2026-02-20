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
    <main className="display-headings min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-30">
        <div>
          <h1 className=" font-extrabold text-brand-brown dark:text-brand-orange">Reset password</h1>
          <h3 className="pt-12 text-brand-brown dark:text-brand-cream font-bold">
            Enter your email for a reset link
            </h3>
            
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-8">
          
          <label className="block text-md font-bold text-brand-brown dark:text-brand-cream">
            
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl px-4 py-3 text-sm border border-brand-brown/50 text-brand-brown font-medium dark:border-brand-cream bg-brand-cream placeholder:text-brand-orange dark:placeholder:text-brand-brown/50 dark:focus:border-brand-orange focus:outline-none"
              placeholder="you@school.edu"
            />
          </label>

          <div className="pt-4">
          <button
            type="submit"
            className="block w-full mx-auto rounded-full border px-4 py-3 text-sm font-semibold text-brand-cream dark:text-brand-cream transition hover:text-brand-cream bg-brand-blue hover:bg-brand-orange dark:bg-brand-blue dark:hover:bg-brand-brown dark:hover:text-brand-orange
           dark:border-brand-blue dark:hover:border-brand-orange"
          >
            
            Send reset link
          </button>
          </div>
        </form>

        {status.type !== "idle" ? (
          <p
            className={`mt-6 italic text-sm ${
              status.type === "error" ? "text-brand-blue" : "text-brand-brown"
            }`}
          >
            {status.message}
          </p>
        ) : null}

        <a
          href="/login"
          className="font-semibold text-brand-brown dark:text-brand-cream hover:text-brand-orange"
        >
          Back to sign in
        </a>
      </div>
    </main>
  );
}
