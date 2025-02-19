import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamContent from "../examContent";

// Mock Next.js Google Font to prevent Jest error
jest.mock("next/font/google", () => ({
  DM_Mono: () => ({ className: "mock-dm-mono" }),
}));

// Mock AnswerSection to isolate ExamContent testing
jest.mock("../answers", () => ({ answer, isRevealed, onToggleReveal }: { answer: string; isRevealed: boolean; onToggleReveal: () => void }) => (
  <div data-testid="answer-section">
    {isRevealed ? <p>{answer}</p> : <p>Answer Hidden</p>}
    <button onClick={onToggleReveal}>{isRevealed ? "Hide Answer" : "Reveal Answer"}</button>
  </div>
));

const mockExam = {
    id: "sample-exam-1", // added id property
    title: "Sample Exam",
    description: "This is a sample exam description.",
    isPublic: true,
    questions: [
      {
        question: "What is 2 + 2?",
        mainAnswer: "4",
        mainAnswerConfidence: 90,
        alternativeAnswers: [],
      },
      {
        question: "What is the capital of France?",
        mainAnswer: "Paris",
        mainAnswerConfidence: 85,
        alternativeAnswers: [],
      },
    ],
  };
  

describe("ExamContent component", () => {
  test("renders the exam title and description", () => {
    render(<ExamContent exam={mockExam} />);

    // Ensure title and description are present
    expect(screen.getByRole("heading", { name: /sample exam/i })).toBeInTheDocument();
    expect(screen.getByText(/this is a sample exam description/i)).toBeInTheDocument();
  });

  test("displays the correct visibility badge", () => {
    render(<ExamContent exam={mockExam} />);

    // Ensure visibility badge is correct (Public in this case)
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  test("renders the Reveal All and Download buttons", () => {
    render(<ExamContent exam={mockExam} />);

    // Ensure buttons are rendered
    expect(screen.getByRole("button", { name: /reveal all answers/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
  });

  test("reveals all answers when clicking Reveal All", () => {
    render(<ExamContent exam={mockExam} />);

    // Click "Reveal All" button
    const revealAllButton = screen.getByRole("button", { name: /reveal all answers/i });
    fireEvent.click(revealAllButton);

    // Ensure all answer sections now display their answers
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();

    // Ensure the button text updates to "Hide All Answers"
    expect(screen.getByRole("button", { name: /hide all answers/i })).toBeInTheDocument();
  });

  test("renders all questions", () => {
    render(<ExamContent exam={mockExam} />);

    // Ensure all questions are displayed
    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
  });
});
