"use client";

import RoleGate from "@/components/RoleGate";

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Staff Tools
          </p>
          <h1 className="text-3xl font-semibold">School staff access</h1>
          <p className="text-sm text-slate-600">
            Only verified staff or super admins can access this area.
          </p>
        </div>

        <RoleGate allowedRoles={["staff_verified", "super_admin"]}>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-700">
              You are cleared to access staff features. This is where moderation
              tools and official replies will live.
            </p>
          </div>
        </RoleGate>
      </div>
    </main>
  );
}
