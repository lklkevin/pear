import { useState } from "react";
import { DM_Mono } from "next/font/google";
import type { AlternativeAnswer } from "./exam";
import ConfidenceBar from "./confidenceBar";
import { motion, AnimatePresence } from "framer-motion";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "300",
});

// Animation variants for the answer container
const containerVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      opacity: { duration: 0.2 },
      height: { duration: 0.3 },
      when: "afterChildren",
    },
  },
};

// Animation variants for the text appearing/disappearing
const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Define props for the AnswerSection component
interface AnswerSectionProps {
  answer: string;
  confidence: number;
  isRevealed: boolean;
  alternativeAnswers?: AlternativeAnswer[];
  onToggleReveal: () => void;
}

export default function AnswerSection({
  answer,
  confidence,
  isRevealed,
  alternativeAnswers,
  onToggleReveal,
}: AnswerSectionProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const hasAlternatives = alternativeAnswers && alternativeAnswers.length > 0;
  const validAlternatives = alternativeAnswers?.slice(0, 3) || [];

  return (
    <div
      className={`bg-zinc-900/50 p-4 rounded-b-md border-b border-x border-zinc-800`}
    >
      <div className="flex items-center justify-between">
        <h3 className="mt-0.5 sm:text-lg font-semibold">Answer</h3>
        <div className="flex items-center gap-4">
          <ConfidenceBar confidence={confidence} />
          <button
            onClick={onToggleReveal}
            className="sm:w-24 px-2 sm:px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
          >
            <span className="material-icons sm:mr-2 text-xl">
              {isRevealed ? "visibility_off" : "visibility"}
            </span>
            <p className="flex-1 sm:block hidden font-medium">
              {isRevealed ? "Hide" : "Reveal"}
            </p>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* The motion.div is always rendered and keyed by isRevealed so that transitions occur on state change */}
        <motion.div
          key={isRevealed ? "open" : "closed"}
          variants={containerVariants}
          initial="hidden"
          animate={isRevealed ? "visible" : "exit"}
          exit="exit"
          className="overflow-hidden"
        >
          {/* Render the answer content only when revealed; you can also always render it and control its opacity */}
          {isRevealed && (
            <>
              <motion.div
                className="mt-4 bg-zinc-900 p-4 rounded font-mono text-sm"
                variants={textVariants}
              >
                <pre className="whitespace-pre-wrap">{answer}</pre>
              </motion.div>

              {hasAlternatives && (
                <div className="gap-4 mt-4">
                  <button
                    onClick={() => setShowAlternatives(!showAlternatives)}
                    className="w-[224px] px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
                  >
                    <span className="material-icons mr-2 text-xl">
                      {showAlternatives ? "unfold_less" : "unfold_more"}
                    </span>
                    <p className="font-medium flex-1">
                      {showAlternatives ? "Hide" : "Show"} Alternative Answers
                    </p>
                  </button>

                  <AnimatePresence mode="wait">
                    {showAlternatives && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-4 overflow-hidden"
                      >
                        {validAlternatives.map((alt, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pt-4 space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium mt-0 sm:mt-auto pt-1.5 sm:pt-0 sm:pb-1 text-sm text-zinc-400">
                                Alternative {index + 1}
                              </span>
                              <ConfidenceBar confidence={alt.confidence} />
                            </div>

                            <motion.div
                              className="bg-zinc-900 p-4 rounded font-mono text-sm"
                              variants={textVariants}
                            >
                              <pre
                                className={`whitespace-pre-wrap ${dmMono.className}`}
                              >
                                {alt.answer}
                              </pre>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
