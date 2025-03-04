import "@/styles/globals.css";
import type { AppProps } from "next/app";
import signOutWithBackend from "@/utils/signOut"
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

import { DM_Sans } from 'next/font/google'

//👇 Configure our font object
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
})

function AuthWatcher() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOutWithBackend(session.refreshToken);
    }
  }, [session]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={dmSans.className}>
      <SessionProvider session={pageProps.session}>
      <AuthWatcher />
      <Component {...pageProps} />
    </SessionProvider>
    </main>
  );
}
