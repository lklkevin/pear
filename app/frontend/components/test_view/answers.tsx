import { useState } from "react"
import { DM_Mono } from "next/font/google"
import type { AlternativeAnswer } from "./exam"
import ConfidenceBar from "./confidenceBar"
import { motion, AnimatePresence } from "framer-motion"

// Load the DM Mono font from Google Fonts
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "300",
})

// Animation variants for the answer container
const containerVariants = {
  hidden: { opacity: 0, height: 0 }, // Start collapsed
  visible: {
    opacity: 1,
    height: "auto", // Expand to fit content
    transition: { duration: 0.4 }, // Smooth transition
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.5 }, // Slightly longer fade-out
  },
}

// Animation variants for the text appearing/disappearing
const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.2, duration: 0.5 }, // Delayed fade-in for smooth appearance
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }, // Faster fade-out
  },
}

// Define props for the AnswerSection component
interface AnswerSectionProps {
  answer: string
  confidence: number
  isRevealed: boolean
  alternativeAnswers?: AlternativeAnswer[]
  onToggleReveal: () => void
}

export default function AnswerSection({
  answer,
  confidence,
  isRevealed,
  alternativeAnswers,
  onToggleReveal,
}: AnswerSectionProps) {
  // State to track whether alternative answers are shown
  const [showAlternatives, setShowAlternatives] = useState(false)

  // Check if there are alternative answers
  const hasAlternatives = alternativeAnswers && alternativeAnswers.length > 0

  // Limit alternative answers displayed (max 3)
  const validAlternatives = alternativeAnswers?.slice(0, 3) || []

  return (
    <div className="bg-zinc-900/50 p-4 rounded-b-lg space-y-4 border-b border-x border-zinc-800">
      {/* Answer Header Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Answer</h3>
        <div className="flex items-center gap-4">
          {/* Confidence bar showing confidence level of main answer */}
          <ConfidenceBar confidence={confidence} />
          {/* Reveal/Hide Answer Button */}
          <button
            onClick={onToggleReveal}
            className="px-2 sm:px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
          >
            <span className="material-icons sm:mr-2 text-xl">
              {isRevealed ? "visibility_off" : "visibility"}
            </span>
            <p className="sm:block hidden">{isRevealed ? "Hide" : "Reveal"}</p>
          </button>
        </div>
      </div>

      {/* Answer Reveal Section */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            {/* Main Answer Box */}
            <motion.div className="bg-zinc-900 p-4 rounded-md font-mono text-sm" variants={textVariants}>
              <pre className="whitespace-pre-wrap">{answer}</pre>
            </motion.div>

            {/* Alternative Answers Section */}
            {hasAlternatives && (
              <div className="space-y-4 mt-4">
                {/* Toggle Alternative Answers Button */}
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className={`px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center`}
                >
                  <span className="material-icons mr-2 text-xl">
                    {showAlternatives ? "unfold_less" : "unfold_more"}
                  </span>
                  {showAlternatives ? "Hide" : "Show"} Alternative Answers
                </button>

                {/* Alternative Answers List */}
                <AnimatePresence>
                  {showAlternatives && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-4"
                    >
                      {validAlternatives.map((alt, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }} // Start slightly below
                          animate={{ opacity: 1, y: 0 }} // Slide up into place
                          exit={{ opacity: 0, y: -10 }} // Fade and move slightly up on exit
                          transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                          className="pt-4 space-y-2"
                        >
                          {/* Alternative Answer Header */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-400">Alternative {index + 1}</span>
                            <ConfidenceBar confidence={alt.confidence} />
                          </div>

                          {/* Alternative Answer Text */}
                          <motion.div className="bg-zinc-900 p-4 rounded-md font-mono text-sm" variants={textVariants}>
                            <pre className={`whitespace-pre-wrap ${dmMono.className}`}>{alt.answer}</pre>
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
