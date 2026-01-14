"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export function useAuthProfile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data, error: sessionError } =
        await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setSession(data.session ?? null);
    };

    loadSession();

    const { data: subscription } = supabaseClient.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) {
          return;
        }
        setSession(nextSession ?? null);
      }
    );

    return () => {
      active = false;
      subscription.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!session?.user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabaseClient
        .from("profiles")
        .select("id, role, school_id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (profileError) {
        setError(profileError.message);
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data ?? null);
      setLoading(false);
    };

    setLoading(true);
    loadProfile();

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  return { session, profile, loading, error };
}
