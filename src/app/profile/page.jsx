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
    <main className="display-headings min-h-screen bg-brand-blue text-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Profile
          </p>
          <h2 className="font-semibold">Your account</h2>
          <h4 className="text-brand-cream">
            Manage your account and access staff tools.
          </h4>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-brand-cream bg-brand-cream p-6 text-sm text-brand-orange">
          
            Loading profile...
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-3xl border border-brand-cram bg-brand-cream p-6">
            <p className="text-sm text-brand-blue">
              You are not signed in.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-md bg-brand-brown px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-orange"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-brand-cream bg-brand-cream p-6">
            <div className="space-y-2 text-sm text-brand-brown">
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
                className="rounded-full border border-brand-brown px-4 py-2 text-sm font-semibold text-brand-brown 
                hover:border-brand-blue hover:bg-brand-blue hover:text-brand-white"
              >
                Staff request
              </Link>
              {canSeeStaff ? (
                <Link
                  href="/staff"
                  className="rounded-full border border-brand-brown px-4 py-2 text-sm font-semibold text-brand-brown  
                  
                  hover:border-brand-orange
                  hover:bg-brand-orange
                  hover:text-brand-cream"
                >
                  Staff tools
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="rounded-full border border-brand-brown px-4 py-2 text-sm font-semibold text-brand-brown 
                  
                  hover:border-brand-blue
                  hover:bg-brand-blue
                  hover:text-brand-cream"
                >
                  Admin dashboard
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-brand-cream hover:bg-brand-brown"
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
