"use client";

import Link from "next/link";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function RoleGate({
  allowedRoles = [],
  children,
  fallback = null,
}) {
  const { session, profile, loading } = useAuthProfile();

  if (loading) {
    return <p className="text-sm text-slate-600">Checking access...</p>;
  }

  if (!session) {
    return (
      <p className="text-sm text-slate-600">
        Please <Link href="/login">sign in</Link> to continue.
      </p>
    );
  }

  const isAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(profile?.role);

  if (!isAllowed) {
    return (
      fallback ?? (
        <p className="text-sm text-slate-600">
          Your account does not have access to this section.
        </p>
      )
    );
  }

  return children;
}
