"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";
import { ModeToggle } from "@/components/ModeToggle"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation";


export default function NavBar() {

  const router = useRouter();

  // STATE: controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const { profile, session, loading } = useAuthProfile();
  const canSeeStaff = ["staff_verified", "super_admin"].includes(profile?.role);
  const [isAdmin, setIsAdmin] = useState(false);
  const isSignedIn = Boolean(session);

  const [searchOpen, setSearchOpen] = useState(false);

  const [q, setQ] = useState("");
  const [phase, setPhase] = useState("all");
  const [radiusKm, setRadiusKm] = useState(25);

  const navRef = useRef(null);
  const [navHeight, setNavHeight] = useState(0);

  function onSearchSubmit(e) {
    e.preventDefault();

    const term = q.trim();
    if (!term) return;

    const phaseParam = phase !== "all" ? `&phase=${encodeURIComponent(phase)}` : "";
    const limitParam = phase !== "all" ? "&limit=100" : "";
    const radiusParam = `&radiusKm=${encodeURIComponent(radiusKm)}`;

    router.push(
      `/schools?q=${encodeURIComponent(term)}${phaseParam}${limitParam}${radiusParam}`
    );

    setSearchOpen(false);
    setMenuOpen(false);
  }

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

      useLayoutEffect(() => {
        const el = navRef.current;
        if (!el) return;

    const measure = () => setNavHeight(el.getBoundingClientRect().height);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  return (
    <>
      {/* Spacer that pushes page content down by the fixed nav height */}
      <div style={{ height: navHeight }} />

      {/* NAV WRAPPER (fixed bar at the top) */}
      <nav
        ref={navRef}
        className="bg-brand-cream dark:bg-brand-brown shadow-md fixed w-full z-50 top-0"
      >
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">

        {/* LEFT SIDE: Logo / Brand */}
        <Link
          href="/"
          className="flex items-center space-x-3">
          <Image
            src="/icons/EduiconPale.png"
            alt="Edurater logo"
            width={70}
            height={70}
            className="rounded-full"
            priority
          />
        </Link>

        {/* RIGHT SIDE (mobile only): Hamburger button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-brand-orange dark:hover:text-brand-brown focus-visible:ring-2 focus-visible:ring-neutral-tertiary focus-visible:rounded-md"
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
          className={cn(
            menuOpen ? "block" : "hidden",
            "absolute right-4 top-full mt-2 w-36 md:static md:block md:w-auto md:mt-0"
          )}
        >

        <ul
          className={cn(
            "flex flex-col md:flex-row md:space-x-8 p-4 md:p-0 rounded-xl shadow-md md:shadow-none",
            "bg-brand-cream dark:bg-brand-brown md:bg-transparent"
          )}
        >
              <li>
                <Link href="/" onClick={closeMenu} className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Home
                </Link>
              </li>
            
            <li>
              <Link href="/aboutus" onClick={closeMenu} className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                About Us
              </Link>
            </li>

            {canSeeStaff ? (
              <li>
                <Link href="/staff" onClick={closeMenu} className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Staff Tools
                </Link>
              </li>
            ) : null}
            {isAdmin ? (
              <li>
                <Link href="/admin" onClick={closeMenu} className="block py-2 px-3 font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange">
                  Admin
                </Link>
              </li>
            ) : null}
            {!loading ? (
              <li>
                {isSignedIn ? (
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <Link
                      href="/profile" onClick={closeMenu}
                      className="block py-2 px-3 font-bold text-brand-orange hover:text-brand-brown dark:text-brand-orange dark:hover:text-brand-blue"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                      className="block py-2 px-3 font-bold text-brand-orange dark:text-brand-orange hover:text-brand-brown dark:hover:text-brand-blue"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={closeMenu} className="block py-2 px-3 font-bold text-brand-orange hover:text-brand-brown dark:text-brand-orange dark:hover:text-brand-blue">
                    Sign in
                  </Link>
                )}
              </li>
            ) : null}

                          {/* Search icon button (desktop + mobile inside menu list) */}
              <li className="flex items-center">
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  className="inline-flex items-center text-brand-brown dark:text-brand-cream hover:text-brand-brown justify-center w-9 h-9 rounded-md hover:bg-brand-orange dark:hover:text-brand-brown focus-visible:ring-2 focus-visible:ring-neutral-tertiary"
                  aria-expanded={searchOpen}
                  aria-controls="navbar-search"
                  aria-label="Open search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </li>

              <li className="flex items-center">
                <ModeToggle onModeSelected={closeMenu}/>
              </li>
          </ul>
        </div>
      </div>

       <div
          id="navbar-search"
          className={cn(
            "border-t border-black/10 dark:border-white/10",
            searchOpen ? "block" : "hidden"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 pb-4">
            <form className="flex items-center gap-2 pt-4" onSubmit={onSearchSubmit}>
              <Search className="w-5 h-5 opacity-70" />
              <input
                autoFocus
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for a school, postcode or area…"
                className="w-full rounded-md px-3 py-2 bg-white/80 dark:bg-black/20 outline-none focus:ring-2 focus:ring-brand-orange"
              />

              <button
                type="submit"
                className="px-3 py-2 rounded-md font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-3 py-2 rounded-md font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </nav>
    </>
  );
}