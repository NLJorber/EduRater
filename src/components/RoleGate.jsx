"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function RoleGate({
  allowedRoles = [],
  children,
  fallback = null,
}) {
  return (
    <Suspense fallback={<p className="text-sm text-brand-blue dark:text-brand-orange">Checking access...</p>}>
      <RoleGateContent
        allowedRoles={allowedRoles}
        fallback={fallback}
      >
        {children}
      </RoleGateContent>
    </Suspense>
  );
}

function RoleGateContent({
  allowedRoles = [],
  children,
  fallback = null,
}) {
  const { session, profile, loading } = useAuthProfile();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasApprovedStaffRequest, setHasApprovedStaffRequest] = useState(false);
  const searchParams = useSearchParams();
  const debugAccess = searchParams?.get("debug") === "1";

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

  useEffect(() => {
    const checkStaffRequest = async () => {
      if (!session?.access_token) {
        setHasApprovedStaffRequest(false);
        return;
      }

      if (!allowedRoles.includes("staff_verified")) {
        setHasApprovedStaffRequest(false);
        return;
      }

      const res = await fetch("/api/staff-requests", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        setHasApprovedStaffRequest(false);
        return;
      }

      const body = await res.json();
      const hasApproved = (body?.data ?? []).some(
        (request) => request?.status === "approved"
      );
      setHasApprovedStaffRequest(hasApproved);
    };

    checkStaffRequest();
  }, [allowedRoles, session?.access_token]);

  if (loading) {
    return <p className="text-sm text-brand-blue dark:text-brand-orange">Checking access...</p>;
  }

  if (!session) {
    return (
      <p className="text-sm text-brand-brown dark:text-brand-orange">
        Please  
        <span className="text-brand-blue dark:text-brand-cream hover:text-brand-orange dark:hover:text-brand-blue font-bold">
        <Link href="/login"> sign in</Link>
        </span> to continue.
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
    (normalizedAllowed.includes("admin") && isAdminRole) ||
    (normalizedAllowed.includes("staff_verified") && hasApprovedStaffRequest);

  if (!isAllowed) {
    return (
      fallback ?? (
        <div className="space-y-3">
          <p className="text-sm text-brand-blue dark:text-brand-orange">
            Your account does not have access to this section.
          </p>
          {debugAccess ? (
            <div className="rounded-lg border border-red-500 bg-slate-50 p-3 text-xs text-slate-700">
              <div>role: {profile?.role ?? "null"}</div>
              <div>isAdmin: {String(isAdminRole)}</div>
              <div>hasApprovedStaffRequest: {String(hasApprovedStaffRequest)}</div>
              <div>userId: {session?.user?.id ?? "null"}</div>
            </div>
          ) : null}
        </div>
      )
    );
  }

  return children;
}
