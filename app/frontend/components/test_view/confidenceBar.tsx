import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "500",
});

/**
 * Props for the ConfidenceBar component
 * @interface ConfidenceBarProps
 * @property {number} confidence - Confidence score as a percentage (0-100)
 */
interface ConfidenceBarProps {
  confidence: number;
}

/**
 * Visual confidence indicator component
 * Displays a percentage value and animated progress bar
 * Features:
 * - Monospace font for percentage display
 * - Gradient progress bar
 * - Responsive sizing for mobile and desktop
 * - Smooth width transition animation
 * 
 * @param {ConfidenceBarProps} props - Component props
 * @returns {JSX.Element} Confidence indicator with percentage and progress bar
 */
export default function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  return (
    <div className="h-9 gap-1 flex flex-col pt-1.5 sm:pt-1">
      <div className="font-medium flex justify-between sm:gap-2 text-zinc-400 text-xs sm:text-sm">
        <span>Confidence: </span>
        <span
          className={`text-xs sm:text-sm text-zinc-400 ${dmMono.className}`}
        >
          {confidence}%
        </span>
      </div>

      <div className="items-center w-[104px] sm:w-32 h-1 bg-zinc-800 rounded-[1px] overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-300"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
