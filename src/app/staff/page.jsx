"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import ReviewsRow from "@/components/ReviewsRow";
import StaffSchoolCharts from "@/components/StaffSchoolCharts";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";

export default function StaffPage() {
  const { profile, loading: profileLoading } = useAuthProfile();
  const [schoolUrn, setSchoolUrn] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [schoolError, setSchoolError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSchool = async () => {
      if (!profile?.school_id) {
        if (active) {
          setSchoolUrn(null);
          setSchoolName("");
          setSchoolError("No school is linked to your profile.");
        }
        return;
      }

      const { data, error } = await supabaseClient
        .from("schools")
        .select("school_urn, name")
        .eq("id", profile.school_id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        setSchoolError(error.message);
        setSchoolUrn(null);
        setSchoolName("");
        return;
      }

      setSchoolUrn(data?.school_urn ?? null);
      setSchoolName(data?.name ?? "");
      if (!data?.school_urn) {
        setSchoolError(
          "Your school is missing a URN. Ask an admin to link it."
        );
      } else {
        setSchoolError("");
      }
    };

    if (!profileLoading) {
      loadSchool();
    }

    return () => {
      active = false;
    };
  }, [profile?.school_id, profileLoading]);

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

          {schoolName ? (
            <div className="rounded-3xl border border-brand-cream bg-brand-cream p-6">
              <p className="text-sm text-brand-brown">
                Showing reviews for <span className="font-semibold">{schoolName}</span>.
              </p>
            </div>
          ) : null}

          {schoolError ? (
            <p className="text-sm text-brand-cream">{schoolError}</p>
          ) : null}

          {schoolUrn ? <StaffSchoolCharts /> : null}
          {schoolUrn ? <ReviewsRow schoolUrn={schoolUrn} /> : null}
        </RoleGate>
      </div>
    </main>
  );
}
