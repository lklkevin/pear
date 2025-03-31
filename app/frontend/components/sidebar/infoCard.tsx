import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "400",
});

/**
 * Props for the GettingStarted component
 * @interface GettingStartedProps
 * @property {number} number - Step number to display
 * @property {string} mainText - Main heading text
 * @property {string} text - Description text
 */
interface GettingStartedProps {
  number: number;
  mainText: string;
  text: string;
}

/**
 * Info card component for displaying step-by-step instructions
 * Features a large number, vertical divider, and text content
 * Uses DM Mono font for the number display
 * 
 * @param {GettingStartedProps} props - Component props
 * @returns {JSX.Element} Info card with number and text content
 */
export default function GettingStarted({
  number,
  mainText,
  text,
}: GettingStartedProps) {
  return (
    <div className="flex items-center p-6 bg-zinc-800 rounded-r-xl">
      <span className={`text-5xl font-bold text-zinc-50 ${dmMono.className}`}>
        {number}
      </span>
      <div className="mx-5 h-20 border-l border-zinc-600" />
      <div className="space-y-1">
        <h2 className="text-base font-medium text-zinc-100">{mainText}</h2>
        <p className="text-xs text-zinc-400">{text}</p>
      </div>
    </div>
  );
}
