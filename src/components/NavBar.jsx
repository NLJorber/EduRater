"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";


export default function NavBar() {
  // STATE: controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile, session, loading } = useAuthProfile();

  const canSeeStaff = ["staff_verified", "super_admin"].includes(
    profile?.role
  );
  const isSignedIn = Boolean(session);

  // no admin link logic

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
  };

  // Toggles between light and dark themes
  const toggleTheme = () => {
    const root = document.documentElement; // <html>
    root.classList.toggle("dark");

    // persist choice
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
  };

  // On initial load, set theme based on saved preference
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    if (saved === "light") document.documentElement.classList.remove("dark");
  }, []);

  return (
    // NAV WRAPPER (fixed bar at the top)
    <nav className="bg-brand-cream dark:bg-brand-brown fixed w-full z-50 top-0 border-b border-default border-brand-blue dark:border-brand-blue">
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

          {/* delete once confirmed not needed */}
          {/* <span className="text-xl font-semibold text-heading text-brand-azure hover:text-brand-red dark:text-white dark:hover:text-brand-custard">
            Edurater
          </span> */}

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
            w-full md:w-auto md:flex
            ${menuOpen ? "block" : "hidden"}
          `}
        >
            <ul className="mt-4 md:mt-0 flex flex-col md:flex-row md:space-x-8 p-4 md:p-0 border md:border-0 rounded-base bg-neutral-secondary-soft md:bg-transparent">
              <li>
                <Link href="/" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Home
                </Link>
              </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                Forum
              </Link>
            </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                Map
              </Link>
            </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                About Us
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
              >
                Night Mode
              </button>
            </li>


            
            {canSeeStaff ? (
              <li>
                <Link href="/staff" className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Staff Tools
                </Link>
              </li>
            ) : null}
            {!loading ? (
              <li>
                {isSignedIn ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block py-2 px-3 font-bold text-brand-orange dark:text-brand-orange hover:text-brand-brown dark:hover:text-brand-blue" 
                  >
                    Sign out
                  </button>
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
