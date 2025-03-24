import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  children,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-full">
      <AnimatePresence mode="wait" initial={false}>
        {isCollapsed ? (
          // Collapsed state: show a centered circular toggle button.
          <motion.div
            key="collapsed"
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            onClick={() => setIsCollapsed(false)}
            className="fixed top-[72px] sm:top-20 left-0 sm:left-4 bg-zinc-900 rounded-full mt-4 ml-4 flex items-center justify-center w-12 h-12 flex-shrink-0 sm:bg-opacity-75 bg-opacity-50 sm:backdrop-blur-sm border border-zinc-800 hover:bg-zinc-800/60 transition-colors"
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-white focus:outline-none"
            >
              <span className="material-icons mt-0.5 ml-0.5 text-2xl">
                keyboard_double_arrow_right
              </span>
            </button>
          </motion.div>
        ) : (
          // Expanded state: show a sliding panel with a collapse button and text.
          <motion.div
            key="expanded"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col bg-zinc-900 left-0 w-[360px] border-r border-zinc-800 h-full"
          >
            <div className="flex sticky top-0 bg-zinc-950/15 z-10 border-b border-zinc-800">
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-white focus:outline-none bg-zinc-900 rounded-full ml-4 sm:ml-8 my-4 sm:my-6 flex items-center justify-center w-12 h-12 flex-shrink-0 bg-opacity-75 xl:bg-opacity-100 border border-zinc-800 hover:bg-zinc-800/60 transition-colors"
              >
                <span className="material-icons mt-0.5 -ml-0.5 text-2xl">
                  keyboard_double_arrow_left
                </span>
              </button>
              <p
                className="flex mt-0.5 h-full items-center justify-center my-auto ml-3 cursor-pointer"
                onClick={() => setIsCollapsed(true)}
              >
                Collapse
              </p>
            </div>
            {/* Content area with improved scrolling */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-900 py-4 sm:py-8">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
