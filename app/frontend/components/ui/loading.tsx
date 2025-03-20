import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DM_Mono } from "next/font/google";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "500",
});

interface ProgressBarProps {
  loadingMessage: string;
  progressPercentage: number;
  onComplete?: () => void;
}

const BREAKPOINTS = [0, 25, 50, 75, 100];

export default function AnimatedProgressBar({
  loadingMessage = "Generating your new exam...",
  progressPercentage,
  onComplete,
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(progressPercentage);

  useEffect(() => {
    // If we've reached 100%, finish immediately.
    if (progressPercentage >= 100) {
      setDisplayProgress(100);
      onComplete?.();
      return;
    }

    // Determine the current and next breakpoints.
    let currentBreakpoint = 0;
    let nextBreakpoint = 100;
    for (let i = 0; i < BREAKPOINTS.length - 1; i++) {
      if (
        progressPercentage >= BREAKPOINTS[i] &&
        progressPercentage < BREAKPOINTS[i + 1]
      ) {
        currentBreakpoint = BREAKPOINTS[i];
        nextBreakpoint = BREAKPOINTS[i + 1];
        break;
      }
    }

    // Ensure displayProgress is at least the current breakpoint.
    if (displayProgress < currentBreakpoint) {
      setDisplayProgress(currentBreakpoint);
    }

    // Auto-increment
    if (displayProgress < nextBreakpoint) {
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const target = nextBreakpoint;
          const newValue = prev + 1;

          if (newValue >= target) {
            clearInterval(interval);
            return target;
          }
          return newValue;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [displayProgress, progressPercentage, onComplete]);

  return (
    <div className="fixed inset-0 bg-zinc-950/75 sm:bg-zinc-950/50 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-2 sm:gap-6 p-6 sm:p-8 bg-zinc-900 rounded-lg border border-zinc-800 max-w-lg sm:w-full overflow-hidden">
        {/* Static Text Content */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <p className="flex-1 sm:text-lg font-medium text-white">
              {loadingMessage}
            </p>
            <p className="mt-1 sm:mt-0 w-full text-sm sm:text-base text-zinc-400">
              Check back in a bit, do not refresh this page
            </p>
          </div>
          <p
            className={`hidden ${dmMono.className} text-2xl items-center sm:flex justify-center text-emerald-400`}
          >
            {Math.floor(displayProgress)}%
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: "0%" }}
            animate={{
              width: `${displayProgress}%`,
              transition: { type: "spring", damping: 30, stiffness: 80 },
            }}
          ></motion.div>
        </div>
      </div>
    </div>
  );
}
