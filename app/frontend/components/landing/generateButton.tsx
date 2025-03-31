import { motion } from "framer-motion";
import { cn } from "@/utils/utils";
import Link from "next/link";

/**
 * Props for the GenerateButton component
 * @interface GenerateButtonProps
 * @property {string} text - Text to display on the button
 */
interface GenerateButtonProps {
  text: string;
}

/**
 * Generate button component for the landing page
 * Links to the exam generation page with hover effects
 * Used in feature cards to demonstrate the generation flow
 * 
 * @param {GenerateButtonProps} props - Component props
 * @returns {JSX.Element} Animated button that links to the generate page
 */
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
