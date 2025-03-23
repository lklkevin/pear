import { useSession } from "next-auth/react";
import Link from "next/link";
import signOutWithBackend from "@/utils/signOut";
import { useRouter } from "next/router";

export default function MobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath); // Preserve current URL

  if (!mobileMenuOpen) return null;

  return (
    <div
      className="absolute top-[72px] left-0 w-full bg-zinc-950 text-white flex flex-col items-center z-50 
      shadow-xl shadow-zinc-950/50 border-b border-zinc-800 sm:hidden pb-4"
      onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
      aria-hidden={!mobileMenuOpen}
    >
      <nav className="w-full text-center">
        <Link href="/browse" className="block text-lg w-screen px-5 py-1">
          <div className="py-2 rounded-md hover:bg-zinc-800">Browse</div>
        </Link>
        <Link href="/generate" className="block text-lg w-screen px-5 py-1">
          <div className="py-2 rounded-md hover:bg-zinc-800">Generate</div>
        </Link>
        {session ? (
          <>
            <Link href="/account" className="block text-lg w-screen px-5 py-1">
              <div className="py-2 rounded-md hover:bg-zinc-800">Account</div>
            </Link>
            <button
              className="block text-lg w-screen px-5 py-1"
              onClick={() => {
                signOutWithBackend(session?.refreshToken);
                setMobileMenuOpen(false);
              }}
            >
              <div className="py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 flex justify-center items-center gap-2">
                <span className="material-icons">logout</span>
                Logout
              </div>
            </button>
          </>
        ) : (
          <Link
            href={`/login?callbackUrl=${callbackUrl}`}
            className="block text-lg w-screen px-5 py-1"
          >
            <div className="py-2 rounded-md bg-zinc-900 hover:bg-zinc-800">
              Login
            </div>
          </Link>
        )}
      </nav>
    </div>
  );
}
