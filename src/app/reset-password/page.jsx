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
    <main className="min-h-screen bg-brand-azure dark:bg-brand-darkgreen text-brand-white dark:text-brand-custard">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-24">
        <div>
          <h1 className="text-4xl font-extrabold text-white">Set new password</h1>
          <p className="mt-3 text-sm text-brand-white">
            Choose a strong password you have not used before.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-bold text-brand-custard">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-lightgrey px-4 py-3 text-sm dark:placeholder:text-brand-midgrey dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="At least 8 characters"
              disabled={!ready}
            />
          </label>
          <label className="block text-sm font-bold text-brand-custard">
            Confirm password
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-2xl border dark:border-brand-lightgrey px-4 py-3 text-sm dark:placeholder:text-brand-midgrey dark:focus:border-brand-lightgrey focus:outline-none"
              placeholder="Re-enter your password"
              disabled={!ready}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full px-4 py-3 text-sm font-semibold text-brand-white dark:text-brand-custard transition hover:text-brand-azure dark:hover:text-brand-darkblue bg-brand-minty dark:bg-brand-darkblue hover:bg-brand-custard"
            disabled={!ready}
          >
            Update password
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
      </div>
    </main>
  );
}
