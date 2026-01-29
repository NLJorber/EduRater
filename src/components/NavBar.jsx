"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";
import { ModeToggle } from "@/components/ModeToggle"



export default function NavBar() {
  // STATE: controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, session, loading } = useAuthProfile();

  const canSeeStaff = ["staff_verified", "super_admin"].includes(
    profile?.role
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const isSignedIn = Boolean(session);

  // no admin link logic

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
    // NAV WRAPPER (fixed bar at the top)
    <nav className="bg-brand-cream dark:bg-brand-brown shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">

        {/* LEFT SIDE: Logo / Brand */}
        <Link
          href="/"
          className="flex items-center space-x-3"
        >
          <Image
            src="/EduRaterLogo.png"
            alt="Edurater logo"
            width={50}
            height={50}
            className="rounded-full"
            priority
          />
        </Link>

        {/* RIGHT SIDE (mobile only): Hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-base hover:bg-neutral-secondary-soft focus:ring-2 focus:ring-neutral-tertiary"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M5 7h14M5 12h14M5 17h14"
            />
          </svg>
        </button>

        {/* MENU LINKS */}
        <div
  className={`
    ${menuOpen ? "block" : "hidden"}
    absolute right-4 top-full mt-2
    w-56
    md:static md:block md:w-auto md:mt-0
  `}
>

<ul className="flex flex-col md:flex-row md:space-x-8 p-4 md:p-0
               rounded-base border
               bg-neutral-secondary-soft md:bg-transparent
               shadow-md md:shadow-none">

              <li>
                <Link href="/" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Home
                </Link>
              </li>
            
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                About Us
              </Link>
            </li>

            <li className="flex items-center">
              <ModeToggle />
            </li>

            {canSeeStaff ? (
              <li>
                <Link href="/staff" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Staff Tools
                </Link>
              </li>
            ) : null}
            {isAdmin ? (
              <li>
                <Link href="/admin" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Admin
                </Link>
              </li>
            ) : null}
            {!loading ? (
              <li>
                {isSignedIn ? (
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <Link
                      href="/profile"
                      className="block py-2 px-3 font-bold text-brand-orange hover:text-brand-brown dark:text-brand-orange dark:hover:text-brand-blue"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="block py-2 px-3 font-bold text-brand-orange dark:text-brand-orange hover:text-brand-brown dark:hover:text-brand-blue"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block py-2 px-3 font-bold text-brand-orange hover:text-brand-brown dark:text-brand-orange dark:hover:text-brand-blue">
                    Sign in
                  </Link>
                )}
              </li>
            ) : null}
          </ul>
        </div>

      </div>
    </nav>
  );
}
