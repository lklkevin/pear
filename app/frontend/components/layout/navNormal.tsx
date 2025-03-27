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
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useCycle,
} from "framer-motion";
import { colors } from "../form/stylingOptions";
import { MenuToggle } from "../ui/menuToggle";
import { useUserStore } from "../../store/user";

export default function Navbar({ landing = false }: { landing?: boolean }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath);

  // Get the username and setter from the global store
  const { username, setUsername } = useUserStore();

  const [menuOpen, toggleMenu] = useCycle(false, true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);

  const closeMenu = () => toggleMenu(0);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 10);
  });

  useEffect(() => {
    async function fetchProfile() {
      if (session?.accessToken) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/profile`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`,
              },
            }
          );
          if (res.ok) {
            const profileData = await res.json();
            setUsername(profileData.username);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    if (showPwdModal || showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      if (!showPwdModal && !showModal) {
        document.body.style.overflow = "unset";
      }
    };
  }, [showPwdModal, showModal]);

  useEffect(() => {
    const handleClickOutside = () => {
      closeMenu();
      closeMobileMenu();
    };
    if (menuOpen || mobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen, mobileMenuOpen]);

  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Nav background & border styles based on conditions
  const getNavStyles = () => {
    if (mobileMenuOpen) {
      return "bg-zinc-950 border-b border-zinc-800/0"; // Mobile menu open: no border
    }
    if (landing) {
      return scrolled
        ? "shadow-lg shadow-zinc-950/25 bg-zinc-950/75 border-b border-zinc-800" // Landing & scrolled: show border
        : "bg-zinc-950 border-b border-zinc-800/0"; // Landing & not scrolled: no border
    }
    return "bg-zinc-950/75 border-b border-zinc-800"; // Other pages: always show border
  };

  return (
    <div className="sticky top-0 z-50">
      <motion.nav
        className={`backdrop-blur-lg text-zinc-400 text-base h-[72px] ${getNavStyles()}`}
        key={`nav-${mobileMenuOpen}`}
        initial={{ borderBottomColor: "rgba(39, 39, 42, 0)" }}
        animate={{
          borderBottomColor: mobileMenuOpen
            ? "rgba(39, 39, 42, 0)"
            : landing
            ? scrolled
              ? "rgba(39, 39, 42, 1)"
              : "rgba(39, 39, 42, 0)"
            : "rgba(39, 39, 42, 1)",
          borderBottomWidth: "1px",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="h-full flex flex-row justify-between max-w-7xl w-full mx-auto px-4 sm:px-8 ">
          <div className="flex items-center h-full space-x-4 sm:space-x-6 md:space-x-8">
            <Link href="/" passHref>
              <div
                className={`select-none h-8 w-16 text-center text-xl font-semibold pt-[1px] text-white rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600/90 hover:bg-emerald-700 transition-colors duration-200 tracking-tighter`}
              >
                pear
              </div>
            </Link>
            <Link
              className={`hidden sm:block font-medium hover:text-white ${
                router.pathname === "/browse" ? "text-white" : "text-zinc-400"
              }`}
              href="/browse"
            >
              Browse
            </Link>
            <Link
              className={`hidden sm:block font-medium hover:text-white ${
                router.pathname === "/generate" ? "text-white" : "text-zinc-400"
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
              <div className="relative hidden sm:flex flex-row items-center justify-center">
                <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
              </div>
            ) : session ? (
              <div className="relative">
                <button
                  className={`pt-[1px] font-semibold text-center text-lg h-9 w-9 rounded-full text-white ${
                    getColorFromName(username || "User").class
                  } transition-all duration-200 hover:ring-4 hover:ring-zinc-800 hover:ring-opacity-50 hidden sm:block`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu();
                  }}
                >
                  {username.charAt(0).toUpperCase() || "U"}
                </button>
              </div>
            ) : (
              <>
                <div className="hidden sm:block">
                  <Link href={`/login?callbackUrl=${callbackUrl}`}>
                    <Button text="Login" />
                  </Link>
                </div>
                <div className="pr-10 sm:pr-0">
                  <Link href={`/signup?callbackUrl=${callbackUrl}`}>
                    <ButtonG text="Sign Up" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      <motion.div
        className="sm:hidden fixed top-[26px] right-[16px] z-[60]"
        animate={mobileMenuOpen ? "open" : "closed"}
        initial={false}
      >
        <MenuToggle toggle={toggleMobileMenu} />
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {mobileMenuOpen && (
          <MobileMenu
            username={username}
            email={session?.user?.email || ""}
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={closeMobileMenu}
            setUsername={setUsername}
            setShowPwdModal={setShowPwdModal}
            showPwdModal={showPwdModal}
            setShowModal={setShowModal}
            showModal={showModal}
          />
        )}
      </AnimatePresence>

      {menuOpen && session && (
        <div className="hidden sm:block relative z-50 max-w-7xl mx-auto">
          <UserDropdown
            username={username}
            email={session.user?.email || ""}
            setUsername={setUsername}
            closeMenu={closeMenu}
            setShowPwdModal={setShowPwdModal}
            showPwdModal={showPwdModal}
            setShowModal={setShowModal}
            showModal={showModal}
          />
        </div>
      )}
    </div>
  );
}
