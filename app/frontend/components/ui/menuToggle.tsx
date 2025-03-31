import * as React from "react";
import { motion } from "framer-motion";

/**
 * SVG path component for menu toggle animation
 * Renders an animated path with consistent styling
 * 
 * @param {any} props - SVG path properties
 * @returns {JSX.Element} Animated SVG path
 */
const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="white"
    strokeLinecap="round"
    {...props}
  />
);

/**
 * Spring animation configuration for menu toggle
 * Provides smooth, natural-feeling transitions
 */
const pathTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

/**
 * Props for the MenuToggle component
 * @interface MenuToggleProps
 * @property {() => void} toggle - Function to toggle menu state
 */
interface MenuToggleProps {
  toggle: () => void;
}

/**
 * Animated hamburger menu toggle component
 * Features:
 * - Smooth path morphing animation
 * - Spring-based transitions
 * - Accessible button with aria-label
 * - SVG-based design
 * 
 * @param {MenuToggleProps} props - Component props
 * @returns {JSX.Element} Animated menu toggle button
 */
export const MenuToggle = ({ toggle }: MenuToggleProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      toggle();
    }}
    className="select-none focus:outline-none"
    aria-label="Toggle menu"
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
        transition={pathTransition}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
        transition={pathTransition}
      />
    </svg>
  </button>
);
