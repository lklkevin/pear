import { useSession } from "next-auth/react";
import Link from "next/link";
import signOutWithBackend from "@/utils/signOut";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import AccountModal from "../account/accountModal";
import { Skeleton } from "../ui/skeleton";

/**
 * Mobile navigation menu component that slides in from the top
 * Provides mobile-friendly navigation links and account options
 * 
 * @param {Object} props - Component props
 * @param {string} props.username - User's current username
 * @param {string} props.email - User's email address
 * @param {boolean} props.mobileMenuOpen - Whether the mobile menu is currently open
 * @param {Function} props.setMobileMenuOpen - Function to set the mobile menu open state
 * @param {Function} props.setUsername - Function to update the username in parent components
 * @param {Function} props.setShowPwdModal - Function to control password modal visibility
 * @param {boolean} props.showPwdModal - Whether the password modal is visible
 * @param {Function} props.setShowModal - Function to control account modal visibility
 * @param {boolean} props.showModal - Whether the account modal is visible
 * @returns {JSX.Element} - Rendered mobile menu with animations
 */
export default function MobileMenu({
  username,
  email,
  mobileMenuOpen,
  setMobileMenuOpen,
  setUsername,
  setShowPwdModal,
  showPwdModal,
  setShowModal,
  showModal,
}: {
  username: string;
  email: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setUsername: (username: string) => void;
  setShowPwdModal: (show: boolean) => void;
  showPwdModal: boolean;
  setShowModal: (show: boolean) => void;
  showModal: boolean;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath); // Preserve current URL

  // Menu item animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        delayChildren: 0.01,
        duration: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        staggerChildren: 0.01,
        staggerDirection: -1,
        when: "afterChildren",
        duration: 0.15,
        opacity: { duration: 0.2 },
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.08 } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
  };

  return (
    <motion.div
      className="overflow-hidden absolute top-[72px] left-0 w-full bg-zinc-950 text-white flex flex-col items-center z-50 
      shadow-xl shadow-zinc-950/50 border-b border-zinc-800 sm:hidden pb-4"
      onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      aria-hidden={!mobileMenuOpen}
      initial={{ height: 0, opacity: 0, y: -10 }}
      animate={{ height: "auto", opacity: 1, y: 0 }}
      exit={{ height: 0, opacity: 0, y: -15 }}
      transition={{
        height: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.15, ease: "easeOut" },
        y: { duration: 0.15, ease: "easeOut" },
      }}
    >
      <motion.nav
        className="w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <motion.div variants={itemVariants}>
          <Link href="/browse" className="block text-lg w-screen px-4 py-1">
            <div
              className={`font-medium py-2 rounded-md hover:bg-zinc-800 ${
                router.pathname === "/browse"
                  ? "text-emerald-400"
                  : "text-zinc-200 hover:text-white"
              }`}
            >
              Browse
            </div>
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link href="/generate" className="block text-lg w-screen px-4 py-1">
            <div
              className={`font-medium py-2 rounded-md hover:bg-zinc-800 ${
                router.pathname === "/generate"
                  ? "text-emerald-400"
                  : "text-zinc-200 hover:text-white"
              }`}
            >
              Generate
            </div>
          </Link>
        </motion.div>
        {status !== "loading" ? (
          session ? (
            <>
              <motion.div variants={itemVariants}>
                <button
                  className="block text-lg w-screen px-4 py-1"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  <div
                    className={`font-medium py-2 rounded-md hover:bg-zinc-800 ${
                      router.pathname === "/account"
                        ? "text-emerald-400"
                        : "text-zinc-200 hover:text-white"
                    }`}
                  >
                    Account
                  </div>
                </button>
              </motion.div>
              <AccountModal
                email={email}
                username={username}
                show={showModal}
                closeModal={() => setShowModal(false)}
                onUsernameUpdated={setUsername}
                setShowPwdModal={setShowPwdModal}
              showPwdModal={showPwdModal}
            />
              <motion.div variants={itemVariants}>
                <button
                  className="block text-lg font-medium w-screen px-4 py-1"
                  onClick={() => {
                    signOutWithBackend(session?.refreshToken);
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="text-zinc-200 hover:text-white font-medium py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 flex justify-center items-center gap-2">
                    <span className="material-icons">logout</span>
                    Logout
                  </div>
                </button>
              </motion.div>
            </>
          ) : (
            <motion.div variants={itemVariants}>
              <Link
                href={`/login?callbackUrl=${callbackUrl}`}
                className="block text-lg w-screen px-4 py-1"
              >
                <div
                  className={`font-medium py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 ${
                    router.pathname === "/login"
                      ? "text-emerald-400"
                      : "text-zinc-200 hover:text-white"
                  }`}
                >
                  Login
                </div>
              </Link>
            </motion.div>
          )
        ) : (
          <div className="px-4 py-1 w-full">
            <Skeleton className="h-[44px]"></Skeleton>
          </div>
        )}
      </motion.nav>
    </motion.div>
  );
}
