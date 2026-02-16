"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ModeToggle";
import { cn } from "@/lib/utils";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-cream dark:bg-brand-brown border-t border-brand-orange dark:border-brand-cream">
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 py-8",
          "flex flex-col gap-6",
          "md:flex-row md:items-center md:justify-between"
        )}
      >
        {/* LEFT: Copyright */}
        <div className="text-sm font-semibold text-brand-blue dark:text-brand-cream">
          © {year} EduRater. All rights reserved.
        </div>

        {/* CENTER: Navigation */}
        <ul className="flex flex-col gap-2 text-sm md:flex-row md:gap-6">
          
          <li>
            <Link
              href="/contact"
              className="font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/privacy"
              className="font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
            >
              Privacy
            </Link>
          </li>
          <li>
            <Link
              href="/terms"
              className="font-bold text-brand-blue hover:text-brand-orange dark:text-brand-cream dark:hover:text-brand-orange"
            >
              Terms
            </Link>
          </li>
        </ul>    
      </div>
    </footer>
  );
}
