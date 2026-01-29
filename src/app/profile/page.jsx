"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function ProfilePage() {
  const { session, profile, loading } = useAuthProfile();
  const isSignedIn = Boolean(session);
  const canSeeStaff = ["staff_verified", "super_admin"].includes(
    profile?.role
  );
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.access_token) {
        setIsAdmin(false);
        return;
      }

      const res = await fetch("/api/admin/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      setIsAdmin(res.ok);
    };

    checkAdmin();
  }, [session?.access_token]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Profile
          </p>
          <h1 className="text-3xl font-semibold">Your account</h1>
          <p className="text-sm text-slate-600">
            Manage your account and access staff tools.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Loading profile...
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-700">
              You are not signed in.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {session?.user?.email}
              </p>
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {isAdmin ? "admin" : profile?.role ?? "user"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/staff-request"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Staff request
              </Link>
              {canSeeStaff ? (
                <Link
                  href="/staff"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Staff tools
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Admin dashboard
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
