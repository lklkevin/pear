import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Toast from "../components/ui/toast";
import { useLoadingStore } from "@/store/store";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

function AuthWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.error === "RefreshAccessTokenError"
    ) {
      console.warn("Session error detected, signing out...");
      signOut();
    }
  }, [session, status]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const { loading } = useLoadingStore();
  return (
    <main className={`${dmSans.className} bg-zinc-950 text-white`}>
      <SessionProvider session={pageProps.session} refetchInterval={5 * 60}>
        <AuthWatcher />
        <Toast />
        <Component {...pageProps} />
      </SessionProvider>
      {!loading && (
        <footer className="w-full h-[72px] border-t border-zinc-800 relative bg-zinc-950">
          <div className="flex flex-row justify-end max-w-7xl mx-auto w-full px-4 sm:px-8 h-full items-center">
            <div className="flex flex-row text-zinc-400">
              &copy; 2025 Pear
              <p className="sm:block hidden">. Made with &lt;3 by Group 27</p>
            </div>
          </div>
        </footer>
      )}
    </main>
  );
}
