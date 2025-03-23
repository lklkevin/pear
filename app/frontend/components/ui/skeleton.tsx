import type React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The shape of the skeleton
   * @default "rectangle"
   */
  variant?: "rectangle" | "circle" | "text";
  /**
   * Whether to animate the entrance/exit
   * @default true
   */
  animate?: boolean;
  /**
   * The duration of the animation in seconds
   * @default 0.3
   */
  duration?: number;
  /**
   * The delay before the animation starts in seconds
   * @default 0
   */
  delay?: number;
}

export function Skeleton({
  className,
  variant = "rectangle",
  animate = true,
  duration = 0.3,
  delay = 0,
}: SkeletonProps) {
  // Animation variants
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: {
      opacity: 0,
      transition: {
        duration: duration * 1.2,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "animate-pulse bg-zinc-900",
        {
          "rounded-full": variant === "circle",
          "rounded-md": variant === "rectangle",
          "rounded h-[1em]": variant === "text",
        },
        // Default to full width if no width class is provided
        !className?.includes("w-") && "w-full",
        // Default to h-4 (1rem) if no height class is provided and not text variant
        !className?.includes("h-") && variant !== "text" && "h-4",
        className
      )}
      {...(animate && {
        initial: "hidden",
        animate: "visible",
        exit: "exit",
        variants,
        transition: {
          duration,
          delay,
          ease: "easeInOut",
        },
      })}
    />
  );
}
