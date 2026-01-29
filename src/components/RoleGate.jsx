"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function RoleGate({
  allowedRoles = [],
  children,
  fallback = null,
}) {
  const { session, profile, loading } = useAuthProfile();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const isAdminRole = profile?.role === "super_admin" || isAdmin;
  const normalizedAllowed = allowedRoles.map((role) =>
    role === "super_admin" ? "admin" : role
  );

  const isAllowed =
    normalizedAllowed.length === 0 ||
    normalizedAllowed.includes(profile?.role) ||
    (normalizedAllowed.includes("admin") && isAdminRole);

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
