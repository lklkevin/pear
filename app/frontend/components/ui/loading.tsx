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
}

const BREAKPOINTS = [0, 25, 50, 75, 100];

export default function AnimatedProgressBar({
  loadingMessage = "Generating your new exam...",
  progressPercentage,
}: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(progressPercentage);

  useEffect(() => {
    // If we've reached 100%, finish immediately.
    if (progressPercentage >= 100) {
      setDisplayProgress(100);
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
    if (displayProgress < nextBreakpoint - 1) {
      const interval = setInterval(() => {
        setDisplayProgress((prev) => {
          const target = nextBreakpoint - 1;
          const remaining = target - prev;

          // Calculate a factor that decreases as we get closer to the target
          const factor = Math.max(0.1, remaining / (target - displayProgress));
          const increment = 0.5 * factor;
          const newValue = prev + increment;

          // Ensure we don't exceed the target
          if (newValue >= target) {
            clearInterval(interval);
            return target;
          }
          return newValue;
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [progressPercentage]);

  return (
    <div className="fixed inset-0 bg-zinc-950/75 sm:bg-zinc-950/50 backdrop-blur-lg z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-2 sm:gap-6 p-6 sm:p-8 bg-zinc-900  rounded-lg border border-zinc-800 max-w-lg sm:w-full overflow-hidden">
        {/* Static Text Content */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <p className="flex-1 sm:text-lg font-medium text-white">
              {loadingMessage}
            </p>
            <p className="mt-0.5 sm:mt-0 w-full text-sm sm:text-base text-zinc-400">
              Check back in a bit, do not refresh this page
            </p>
          </div>
          <div className="relative w-16 h-16 hidden sm:block">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-emerald-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className={`text-xl text-emerald-400 ${dmMono.className}`}>
                {Math.floor(displayProgress)}%
              </p>
            </div>
          </div>
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
