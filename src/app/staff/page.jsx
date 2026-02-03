"use client";

import RoleGate from "@/components/RoleGate";

export default function StaffPage() {
  return (
    <main className="display-headings min-h-screen bg-brand-blue text-brand-cream">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <div className="space-y-2">
          <h2 className="font-semibold">School staff access</h2>
          <h4 className="text-brand-cream">
            Only verified staff or admins can access this area.
          </h4>
        </div>

        <RoleGate allowedRoles={["staff_verified", "admin"]}>
          <div className="rounded-3xl border border-brand-cream bg-brand-cream p-6">
            <p className="text-sm text-brand-brown">
              You are cleared to access staff features. This is where moderation
              tools and official replies will live.
            </p>
          </div>
        </RoleGate>
      </div>
    </main>
  );
}
