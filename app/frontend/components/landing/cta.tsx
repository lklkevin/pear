import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="text-center">
      <Link href="/generate" passHref>
        <button className="gap-4 drop-shadow-xl backdrop-blur-lg z-10 group flex items-center justify-between rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600/90 text-white px-4 py-2 font-medium text-left transition-colors duration-200 hover:bg-emerald-700">
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
