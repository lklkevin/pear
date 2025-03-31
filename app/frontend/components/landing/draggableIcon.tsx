import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

/**
 * Props for the DraggableIcon component
 * @interface DraggableIconProps
 * @property {string} icon - Material icon name to display
 * @property {string} [bgColor="bg-zinc-800"] - Background color class
 * @property {string} [borderColor="border-zinc-700"] - Border color class
 * @property {string} [textColor="text-white"] - Text color class
 * @property {string} [rounded="rounded-lg sm:rounded-xl"] - Border radius classes
 */
interface DraggableIconProps {
  icon: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  rounded?: string;
}

/**
 * Interactive draggable icon component
 * Features elastic drag behavior with constraints
 * Customizable styling through props
 * 
 * @param {DraggableIconProps} props - Component props
 * @returns {JSX.Element} Draggable icon with material design icon
 */
export default function DraggableIcon({ 
  icon, 
  bgColor = "bg-zinc-800",
  borderColor = "border-zinc-700",
  textColor = "text-white",
  rounded = "rounded-lg sm:rounded-xl"
}: DraggableIconProps) {
  return (
    <motion.div 
      className={cn(
        "w-full h-full border-2 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors",
        rounded,
        bgColor,
        borderColor,
        textColor
      )}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
    >
      <span className="material-icons text-3xl sm:text-4xl">
        {icon}
      </span>
    </motion.div>
  );
} 