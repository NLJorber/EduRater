"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  const setError = (message) =>
    setStatus({ type: "error", message: message ?? "Something went wrong." });
  const setMessage = (message) => setStatus({ type: "info", message });

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (!active) return;

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.session) {
        setReady(true);
        return;
      }

      setError("This reset link is invalid or has expired.");
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!ready) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setStatus({ type: "loading", message: "Updating password..." });
    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    await supabaseClient.auth.signOut();
    setMessage("Password updated. Please sign in again.");
    router.replace("/login");
  };

  return (
    <main className="display-headings min-h-screen bg-brand-blue dark:bg-brand-brown text-brand-cream dark:text-brand-orange">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-24">
        <div>
          <h1 className="font-extrabold text-cream">Set a new password</h1>
          <h4 className="mt-10 font-bold text-brand-cream dark:text-brand-cream">
            Choose a strong password you have not used before.
          </h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-brand-cream dark:border-brand-cream px-4 py-3 text-sm placeholder:text-brand-cream/40 dark:placeholder:text-brand-orange/30 dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="At least 8 characters"
              disabled={!ready}
            />
          </label>
          <label className="block text-sm font-bold text-brand-brown dark:text-brand-orange">
            Confirm password
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-cream px-4 py-3 text-sm placeholder:text-brand-cream/40 dark:placeholder:text-brand-orange/30 dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="Re-enter your password"
              disabled={!ready}
            />
          </label>

          <button
            type="submit"
            className="block mx-auto rounded-full px-4 py-3 text-sm font-semibold text-brand-orange dark:text-brand-cream transition hover:text-brand-blue dark:hover:text-brand-brown bg-brand-cream dark:bg-brand-brown hover:bg-brand-cream"
            disabled={!ready}
          >
            Update password
          </button>
        </form>

        {status.type !== "idle" ? (
          <p
            className={`text-sm ${
              status.type === "error" ? "text-brand-orange" : "text-brand-cream"
            }`}
          >
            {status.message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
