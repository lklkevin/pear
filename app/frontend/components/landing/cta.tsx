import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="text-center fixed bottom-0 mb-12 sm:mb-0 left-0 right-0 sm:static md:mt-24 z-10 ">
      <Link href="/generate" passHref>
        <button className="drop-shadow-xl backdrop-blur-lg z-10 group mx-auto w-[20rem] sm:w-[26rem] max-w-lg flex items-center justify-between rounded-2xl sm:rounded-3xl bg-emerald-300 bg-opacity-15 text-white py-3 sm:py-4 px-6 border border-white font-medium text-lg text-left transition-colors duration-200 hover:bg-opacity-20">
          <span className="drop-shadow-xl">Try now for free</span>
          <span className="material-icons text-3xl transition-transform duration-200 group-hover:translate-x-2">
            arrow_forward
          </span>
        </button>
      </Link>
    </section>
  );
};

export default CTA;
