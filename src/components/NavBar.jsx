"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";


export default function NavBar() {
  // STATE: controls whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    // NAV WRAPPER (fixed bar at the top)
    <nav className="bg-brand-5 fixed w-full z-20 top-0 border-b border-default border-brand-5">
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
          <span className="text-xl font-semibold text-heading text-brand-1">
            Edurater
          </span>
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
              <Link href="#" className="block py-2 px-3 font-bold text-brand-1">
                Home
              </Link>
            </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-1">
                Forum
              </Link>
            </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-1">
                Map
              </Link>
            </li>
            <li>
              <Link href="#" className="block py-2 px-3 font-bold text-brand-1">
                About Us
              </Link>
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
}
