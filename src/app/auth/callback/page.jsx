"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    let active = true;

    const finalizeSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data?.session) {
        router.replace("/");
        return;
      }

      setMessage("Please return to the login page to finish sign-in.");
    };

    finalizeSession();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-6 py-20">
        <h1 className="text-2xl font-semibold">Authenticating</h1>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
    </main>
  );
}
