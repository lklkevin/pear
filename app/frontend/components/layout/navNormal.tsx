import Link from "next/link";
import ButtonG from "@/components/ui/buttonGreen"
import Button from "@/components/ui/buttonGray"

export default function Home() {
    return (
        <nav className="text-zinc-400 text-md flex flex-row w-screen h-[72px] bg-zinc-950 px-10 justify-between py-3">
            <div className=" flex items-center h-full space-x-8">
                <div className="h-9 w-9 bg-zinc-950 border border-zinc-700 rounded-full"></div>
                <Link className="hover:text-white" href="/about">Browse</Link>
                <Link className="hover:text-white" href="/about">Generate</Link>
                <Link className="hover:text-white" href="/about">Pricing</Link>
                <Link className="hover:text-white" href="/about">Contact</Link>
            </div>
            <div className="text-zinc-200 flex items-center h-full space-x-6">
                <Button text="Login"></Button>
                <ButtonG text="Sign Up"></ButtonG>
            </div>
        </nav>
    )
}