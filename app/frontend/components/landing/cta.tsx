import Link from "next/link";
import React from "react";

/**
 * Call-to-action button component
 * Features a gradient background and hover animation
 * Links to the exam generation page
 * 
 * @returns {JSX.Element} Animated CTA button with link
 */
const CTA = () => {
  return (
    <section className="text-center">
      <Link href="/generate" passHref>
        <button className="gap-4 drop-shadow-xl shadow-zinc-950 backdrop-blur-lg z-10 group flex items-center justify-between rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600/90 text-white px-4 py-2 sm:px-5 sm:py-2.5 font-medium text-left transition-colors duration-200 hover:bg-emerald-700">
          <span className="drop-shadow-xl">Try now for free</span>
          <span className="mt-[1px] material-icons text-xl transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </Link>
    </section>
  );
};

export default CTA;
