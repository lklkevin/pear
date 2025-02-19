import Link from "next/link";
import ButtonG from "../ui/buttonGreen";
import Button from "../ui/buttonGray";

export default function Home({ landing = false }: { landing?: boolean }) {
  return (
    <nav
      className={`text-zinc-400 text-sm md:text-base flex flex-row w-screen h-[72px] bg-zinc-950 px-8 md:px-10 justify-between py-3 ${
        landing ? "" : "border-b border-zinc-800"
      }`}
    >
      <div className="flex items-center h-full space-x-4 md:space-x-8">
        <Link href="/" passHref>
          <div className="h-9 w-9 bg-zinc-950 border border-zinc-700 rounded-full"></div>
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/browse">
          Browse
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/generate">
          Generate
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/pricing">
          Pricing
        </Link>
        <Link className="hidden sm:block hover:text-white" href="/contact">
          Contact
        </Link>
      </div>
      <div className="text-zinc-200 flex items-center h-full space-x-4 md:space-x-6">
        <Link href="/login">
          <Button text="Login" />
        </Link>
        <Link href="/signup">
          <ButtonG text="Sign Up" />
        </Link>
      </div>
    </nav>
  );
}
