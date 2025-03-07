import Link from "next/link";
import { useRouter } from "next/router";
import ButtonG from "../ui/buttonGreen";
import Button from "../ui/buttonGray";

export default function Home({ landing = false }: { landing?: boolean }) {
  const router = useRouter();
  const callbackUrl = encodeURIComponent(router.asPath); // Preserve current URL

  return (
    <nav
      className={`text-zinc-400 text-sm md:text-base flex flex-row w-screen h-[72px] px-8 md:px-10 justify-between py-3 ${
        landing ? "bg-transparent" : "bg-zinc-950 border-b border-zinc-800"
      }`}
    >
      <div className="flex items-center h-full space-x-4 md:space-x-8">
        <Link href="/" passHref>
          <div className="items-center flex justify-center text-lg text-emerald-400 h-9 w-9 bg-emerald-900 border border-emerald-400 rounded-full">:3</div>
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/browse">
          Browse
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/generate">
          Generate
        </Link>
      </div>
      <div className="text-zinc-200 flex items-center h-full space-x-4 md:space-x-6">
        {/* Preserve the callback URL for login */}
        <Link href={`/login?callbackUrl=${callbackUrl}`}>
          <Button text="Login" />
        </Link>
        <Link href={`/signup?callbackUrl=${callbackUrl}`}>
          <ButtonG text="Sign Up" />
        </Link>
      </div>
    </nav>
  );
}
