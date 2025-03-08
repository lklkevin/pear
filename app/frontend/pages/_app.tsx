import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import Toast from "../components/ui/toast";

import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

function AuthWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.error === "RefreshAccessTokenError") {
      console.warn("Session error detected, signing out...");
      signOut();
    }
  }, [session, status]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={dmSans.className}>
      <SessionProvider session={pageProps.session} refetchInterval={5 * 60}>
        <AuthWatcher />
        <Toast />
        <Component {...pageProps} />
      </SessionProvider>
    </main>
  );
}