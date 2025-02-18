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
    <div className="relative">
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
            className="bg-zinc-900 rounded-full mt-4 ml-4 flex items-center justify-center w-12 h-12 flex-shrink-0 bg-opacity-75 xl:bg-opacity-100 border border-zinc-800"
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-white focus:outline-none"
            >
              <span className="material-icons mt-0.5 text-2xl">
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
            style={{
              overflowY: "auto",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
            className="bg-zinc-900 h-screen absolute left-0 w-[360px] border-r border-zinc-800"
          >
            {/* Inline style to hide scrollbar for Webkit browsers */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div
              className="flex items-center mt-4 ml-4 mb-4 cursor-pointer"
              onClick={() => setIsCollapsed(true)}
            >
              <button
                onClick={() => setIsCollapsed(true)}
                className="bg-zinc-900 rounded-full flex items-center justify-center w-12 h-12 flex-shrink-0 focus:outline-none"
              >
                <span className="material-icons -ml-0.5 text-2xl">
                  keyboard_double_arrow_left
                </span>
              </button>
              <span className="text-base text-zinc-300 -ml-1.5">Collapse</span>
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
