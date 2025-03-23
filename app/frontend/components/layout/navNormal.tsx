"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import ButtonG from "../ui/buttonGreen";
import Button from "../ui/buttonGray";
import { useSession } from "next-auth/react";
import UserDropdown from "../account/userDropdown";
import { useState, useEffect } from "react";
import MobileMenu from "./mobileMenu";
import { Skeleton } from "../ui/skeleton";
import { useScroll } from "@/utils/useScroll";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ landing = false }: { landing?: boolean }) {
  const { data: session, status } = useSession(); // Get authentication state

  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath); // Preserve current URL
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const scrolled = useScroll(10);

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
    <div className="sticky top-0 z-50">
      <motion.nav
        className={`backdrop-blur-lg text-zinc-400 text-base h-[72px] ${
          landing
            ? scrolled && !mobileMenuOpen
              ? "shadow-lg shadow-zinc-950/25 bg-zinc-950/75"
              : "bg-zinc-950"
            : mobileMenuOpen
            ? "bg-zinc-950"
            : "bg-zinc-950/75 border-b border-zinc-800"
        }`}
        key={`nav-${mobileMenuOpen}`}
        initial={
          landing || mobileMenuOpen
            ? { borderBottomColor: "rgba(39, 39, 42, 0)" }
            : false
        }
        animate={
          landing || mobileMenuOpen
            ? {
                borderBottomColor:
                  scrolled && !mobileMenuOpen
                    ? "rgba(39, 39, 42, 1)"
                    : "rgba(39, 39, 42, 0)",
                borderBottomWidth: "1px",
              }
            : false
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full flex flex-row justify-between max-w-7xl w-full mx-auto px-4 sm:px-8 ">
          <div className="flex items-center h-full space-x-4 sm:space-x-8">
            <Link href="/" passHref>
              <div
                className={`h-8 w-16 text-center text-xl font-semibold pt-[1px] text-white rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600/90 hover:bg-emerald-700 transition-colors duration-200 tracking-tighter`}
              >
                pear
              </div>
            </Link>
            <Link
              className={` hidden sm:block font-medium hover:text-white ${
                router.pathname === "/browse" ? "text-white" : "text-gray-400"
              }`}
              href="/browse"
            >
              Browse
            </Link>
            <Link
              className={`hidden sm:block font-medium hover:text-white ${
                router.pathname === "/generate" ? "text-white" : "text-gray-400"
              }`}
              href="/generate"
            >
              Generate
            </Link>
          </div>

          <div
            className={`text-zinc-200 flex items-center h-full ${
              status === "loading" ? "" : "space-x-4 md:space-x-6"
            }`}
          >
            {status === "loading" ? (
              <div className="relative flex flex-row items-center justify-center">
                <Skeleton className="h-9 w-9 rounded-full bg-zinc-800"></Skeleton>
              </div>
            ) : session ? (
              // Show this when user is logged in
              <div className="relative">
                {/* Avatar Button */}
                <button
                  className={`pt-[1px] font-semibold text-center text-lg h-9 w-9 rounded-full text-white ${getColorFromName(
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
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}
      </AnimatePresence>
      
      <div className="hidden sm:block relative z-50 max-w-7xl mx-auto">
        {menuOpen && session && (
          <UserDropdown
            name={session.user?.name || "User"}
            email={session.user?.email || ""}
            closeMenu={closeMenu}
          />
        )}
      </div>
    </div>
  );
}
