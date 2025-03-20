import { useState } from "react";
import { DM_Mono } from "next/font/google";
import { Exam } from "./exam";
import AnswerSection from "./answers";
import { handleDownload } from "@/utils/exportPDF";

// Load the DM Mono font from Google Fonts
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: "300",
});

export default function ExamContent({ exam }: { exam: Exam }) {
  // State to track which answers are revealed
  const [revealedAnswers, setRevealedAnswers] = useState<boolean[]>(
    new Array(exam.questions.length).fill(false)
  );

  // Toggle all answers at once
  const toggleAllAnswers = (reveal: boolean) => {
    setRevealedAnswers(new Array(exam.questions.length).fill(reveal));
  };

  // Toggle a single answer by index
  const toggleAnswer = (index: number) => {
    setRevealedAnswers((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Check if all answers are revealed
  const allRevealed = revealedAnswers.every(Boolean);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Exam visibility badge (Public or Private) */}
      <div className="flex items-center gap-4 mb-4">
        <span
          className={`px-3 py-1 text-sm rounded-full bg-zinc-800 text-zinc-400`}
        >
          {`${exam.privacy}`}
        </span>
      </div>

      {/* Exam title and description */}
      <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
        {exam.title}
      </h1>
      <p className="text-sm sm:text-base text-zinc-400 mt-2 sm:mt-4 mb-4 sm:mb-8">
        {exam.description}
      </p>

      {/* Buttons: Reveal/Hide All Answers & Download */}
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <button
          className="w-48 sm:w-[200px] font-medium px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
          onClick={() => toggleAllAnswers(!allRevealed)}
        >
          <span className="material-icons mr-2 text-xl">
            {allRevealed ? "visibility_off" : "visibility"}
          </span>
          <p className="pt-[0.5px] sm:pt-0 flex-1 text-sm sm:text-base font-medium">
            {allRevealed ? "Hide" : "Reveal"} All Answers
          </p>
        </button>
        <button
          className="px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
          onClick={() => handleDownload(exam)}
        >
          <span className="material-icons sm:mr-2 text-xl">download</span>
          <p className="hidden sm:block font-medium">Download</p>
        </button>
      </div>

      {/* Render each question */}
      <div className="space-y-6 sm:space-y-8">
        {exam.questions.map((question, index) => (
          <div key={index}>
            {/* Question title */}
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
              Question {index + 1}
            </h2>

            {/* Question text in a styled preformatted box */}
            <div className="bg-zinc-900 p-4 rounded-t-md font-mono border border-zinc-800">
              <pre
                className={`text-sm whitespace-pre-wrap ${dmMono.className}`}
              >
                {question.question}
              </pre>
            </div>

            {/* Answer section (toggleable reveal) */}
            <AnswerSection
              answer={question.mainAnswer}
              confidence={question.mainAnswerConfidence}
              isRevealed={revealedAnswers[index]}
              alternativeAnswers={question.alternativeAnswers}
              onToggleReveal={() => toggleAnswer(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
