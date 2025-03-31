import Link from "next/link";

/**
 * Call-to-action section component for the landing page
 * Displays a final call-to-action with sign up and try now buttons
 * Features responsive text and button sizing
 * 
 * @returns {JSX.Element} CTA section with sign up and try now buttons
 */
export default function CtaSection() {
  return (
    <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 mb-2 sm:mb-0">
      <div className="max-w-7xl mx-auto p-4 sm:p-8">
        <h1 className="hidden sm:block text-5xl font-bold tracking-tight">
          Get Started with Pear
        </h1>
        <h1 className="block sm:hidden text-4xl font-bold tracking-tight">
          Get Started
        </h1>
        <div className="flex flex-row gap-4 sm:gap-6 mt-4 sm:mt-6">
          <Link href="/signup">
            <button
              className={`sm:text-lg w-32 sm:w-48 font-semibold sm:px-8 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 tracking-normal bg-zinc-950 border-zinc-700 border hover:bg-zinc-700 hover:text-white`}
            >
              Sign Up
            </button>
          </Link>
          <Link href="/generate">
          <button
              className={`sm:text-lg w-32 sm:w-48 font-semibold sm:px-8 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-all duration-200 tracking-normal bg-emerald-900 border-emerald-400 border hover:bg-emerald-800 hover:text-white`}
            >
              Try Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
