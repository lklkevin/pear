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
            className="fixed top-[72px] sm:top-20 left-0 sm:left-4 bg-zinc-900 rounded-full mt-4 ml-4 flex items-center justify-center w-12 h-12 flex-shrink-0 sm:bg-opacity-75 bg-opacity-50 sm:backdrop-blur-sm border border-zinc-800"
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
            className="min-h-[calc(100vh-72px)] flex flex-col bg-zinc-900 left-0 w-[360px] border-r border-zinc-800"
          >
            <div className="flex">
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-white focus:outline-none bg-zinc-900 rounded-full ml-8 my-6 flex items-center justify-center w-12 h-12 flex-shrink-0 bg-opacity-75 xl:bg-opacity-100 border border-zinc-800"
              >
                <span className="material-icons mt-0.5 -ml-0.5 text-2xl">
                  keyboard_double_arrow_left
                </span>
              </button>
              <p
                className="h-full items-center justify-center my-auto ml-3 cursor-pointer"
                onClick={() => setIsCollapsed(true)}
              >
                Collapse
              </p>
            </div>
            {/* This container now uses a custom class for a narrow, colored scrollbar */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .custom-scrollbar {
          /* Firefox */
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
        /* Webkit browsers */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 10px;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
}
