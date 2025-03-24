import { useEffect, useState } from "react";
import { useErrorStore } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast() {
  const { errorMessage, setError } = useErrorStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 8000); // Hide toast after 8s

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle complete exit animation
  const handleAnimationComplete = () => {
    if (!visible) {
      setError(null);
    }
  };

  if (!errorMessage) return null;

  return (
    <AnimatePresence mode="wait" onExitComplete={handleAnimationComplete}>
      {visible && (
        <motion.div
          className="fixed top-8 left-1/2 z-[999]"
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div className="relative flex items-center w-[400px] max-w-[90vw] rounded-md sm:rounded-lg overflow-hidden border border-zinc-700 shadow-lg">
            {/* Background with blur */}
            <div className="absolute inset-0 bg-zinc-950"></div>

            <div className="relative flex items-center gap-3 px-5 py-4 text-white w-full">
              <div className="flex-1">{errorMessage}</div>
              <button
                onClick={() => setVisible(false)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <span
                  className="material-icons mt-1.5"
                  style={{ fontSize: "18px" }}
                >
                  close
                </span>
              </button>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-red-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: 8,
                ease: "linear",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
