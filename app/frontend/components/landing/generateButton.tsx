import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import Link from "next/link";

interface GenerateButtonProps {
  text: string;
}

export default function GenerateButton({ text }: GenerateButtonProps) {
  return (
    <Link href="/generate" className="col-span-2">
      <motion.div
        className={cn(
          "border-zinc-700 w-full h-full rounded-lg sm:rounded-xl border-2 flex items-center justify-center font-semibold sm:text-lg cursor-pointer transition-colors",
          "hover:bg-zinc-700/20 hover:text-white"
        )}
      >
        {text}
      </motion.div>
    </Link>
  );
}
