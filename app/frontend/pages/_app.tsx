import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { DM_Sans } from 'next/font/google'

//👇 Configure our font object
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={dmSans.className}>
      <Component {...pageProps} />
    </main>
  );
}
