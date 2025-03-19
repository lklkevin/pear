import Link from "next/link";
import { useRouter } from "next/router";
import ButtonG from "../ui/buttonGreen";
import Button from "../ui/buttonGray";
import { useSession } from "next-auth/react";
import UserDropdown from "../account/userDropdown";
import { useState, useEffect } from "react";
import MobileMenu from "./mobileMenu";
import { Skeleton } from "../ui/skeleton";

export default function Navbar({ landing = false }: { landing?: boolean }) {
  const { data: session, status } = useSession(); // Get authentication state

  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath); // Preserve current URL
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = () => {
      closeMenu();
      setMobileMenuOpen(false);
    };
    if (menuOpen || mobileMenuOpen)
      document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, mobileMenuOpen]);

  // Close menu when clicking anywhere on the document
  useEffect(() => {
    const handleClickOutside = () => closeMenu();
    if (menuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const colors = [
    "bg-cyan-700",
    "bg-indigo-700",
    "bg-violet-700",
    "bg-pink-700",
    "bg-red-700",
    "bg-amber-700",
  ];

  // Function to hash a string into an index
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length]; // Pick color based on hash
  };

  return (
    <nav
      className={`relative text-zinc-400 text-sm md:text-base flex flex-row w-screen h-[72px] px-5 sm:px-8 justify-between py-3 ${
        landing
          ? "bg-transparent"
          : `bg-zinc-950 ${mobileMenuOpen ? "" : "border-b border-zinc-800"}`
      }`}
    >
      <div className="flex items-center h-full space-x-4 md:space-x-8">
        <Link href="/" passHref>
          <div className="items-center flex justify-center text-lg text-emerald-400 h-9 w-9 bg-emerald-900 border border-emerald-400 rounded-full">
            :3
          </div>
        </Link>
        <Link
          className={`hidden sm:block hover:text-white ${
            router.pathname === "/browse" ? "text-white" : "text-gray-400"
          }`}
          href="/browse"
        >
          Browse
        </Link>
        <Link
          className={`hidden sm:block hover:text-white ${
            router.pathname === "/generate" ? "text-white" : "text-gray-400"
          }`}
          href="/generate"
        >
          Generate
        </Link>
      </div>

      <div className="text-zinc-200 flex items-center h-full space-x-4 md:space-x-6">
        {status === "loading" ? (
          <div className="relative flex flex-row items-center gap-4 md:gap-6">
            <Skeleton className="h-8 w-24 sm:w-36 rounded-md"></Skeleton>
          </div>
        ) : session ? (
          // Show this when user is logged in
          <div className="relative">
            {/* Avatar Button */}
            <button
              className={`h-9 w-9 rounded-full text-white font-semibold ${getColorFromName(
                session.user?.name || "User"
              )}
              transition-all duration-200 hover:ring-4 hover:ring-zinc-800 hover:ring-opacity-50 hidden sm:block`}
              onClick={(e) => {
                e.stopPropagation(); // Prevents triggering the document click event
                toggleMenu();
              }}
            >
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </button>

            {menuOpen && (
              <UserDropdown
                name={session.user?.name || "User"}
                email={session.user?.email || ""}
                closeMenu={closeMenu}
              />
            )}
          </div>
        ) : (
          // Show this when user is logged out
          <>
            <div className="hidden sm:block">
              <Link href={`/login?callbackUrl=${callbackUrl}`}>
                <Button text="Login" />
              </Link>
            </div>

            <Link href={`/signup?callbackUrl=${callbackUrl}`}>
              <ButtonG text="Sign Up" />
            </Link>
          </>
        )}

        {/* Mobile Menu Button (Always Visible on Small Screens) */}
        <div className="sm:hidden">
          {status !== "loading" && (
            <button
              className="block sm:hidden focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                toggleMobileMenu();
              }}
            >
              <span className="material-icons text-white text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          )}
          {mobileMenuOpen && (
            <MobileMenu
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
            />
          )}
        </div>
      </div>
    </nav>
  );
}
