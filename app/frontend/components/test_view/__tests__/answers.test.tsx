import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnswerSection from "../answers";

// Mock Framer Motion to avoid animation-related test issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("next/font/google", () => ({
    DM_Mono: () => ({ className: "mock-dm-mono" }),
  }));  

// Mock ConfidenceBar component
jest.mock("../confidenceBar", () => ({ confidence }: { confidence: number }) => (
  <div data-testid="confidence-bar">{`Confidence: ${confidence}%`}</div>
));

describe("AnswerSection component", () => {
  const mockAnswer = "This is the correct answer.";
  const mockAlternativeAnswers = [
    { answer: "Alternative answer 1", confidence: 80 },
    { answer: "Alternative answer 2", confidence: 70 },
  ];
  let mockOnToggleReveal: jest.Mock;

  beforeEach(() => {
    mockOnToggleReveal = jest.fn();
  });

  test("renders the Reveal button initially", () => {
    render(<AnswerSection answer={mockAnswer} confidence={90} isRevealed={false} onToggleReveal={mockOnToggleReveal} />);

    // Ensure the Reveal button is visible
    expect(screen.getByRole("button", { name: /reveal/i })).toBeInTheDocument();
  });

  test("reveals the answer when the Reveal button is clicked", () => {
    render(<AnswerSection answer={mockAnswer} confidence={90} isRevealed={false} onToggleReveal={mockOnToggleReveal} />);

    const revealButton = screen.getByRole("button", { name: /reveal/i });
    fireEvent.click(revealButton);

    // Ensure the onToggleReveal function is called
    expect(mockOnToggleReveal).toHaveBeenCalledTimes(1);
  });

  test("displays the answer when isRevealed is true", () => {
    render(<AnswerSection answer={mockAnswer} confidence={90} isRevealed={true} onToggleReveal={mockOnToggleReveal} />);

    // Ensure the answer text is displayed
    expect(screen.getByText(mockAnswer)).toBeInTheDocument();

    // Ensure the Hide button is now present
    expect(screen.getByRole("button", { name: /hide/i })).toBeInTheDocument();
  });

  test("renders the confidence bar", () => {
    render(<AnswerSection answer={mockAnswer} confidence={90} isRevealed={true} onToggleReveal={mockOnToggleReveal} />);

    // Ensure confidence bar is rendered
    expect(screen.getByTestId("confidence-bar")).toHaveTextContent("Confidence: 90%");
  });

  test("renders alternative answers when the button is clicked", () => {
    render(
      <AnswerSection
        answer={mockAnswer}
        confidence={90}
        isRevealed={true}
        alternativeAnswers={mockAlternativeAnswers}
        onToggleReveal={mockOnToggleReveal}
      />
    );

    // Ensure the "Show Alternative Answers" button exists
    const showAltButton = screen.getByRole("button", { name: /show alternative answers/i });
    expect(showAltButton).toBeInTheDocument();

    // Click to reveal alternative answers
    fireEvent.click(showAltButton);

    // Ensure alternative answers are displayed
    expect(screen.getByText("Alternative answer 1")).toBeInTheDocument();
    expect(screen.getByText("Alternative answer 2")).toBeInTheDocument();
  });

  test("hides alternative answers when the button is clicked again", () => {
    render(
      <AnswerSection
        answer={mockAnswer}
        confidence={90}
        isRevealed={true}
        alternativeAnswers={mockAlternativeAnswers}
        onToggleReveal={mockOnToggleReveal}
      />
    );

    // Click the button to show alternative answers
    const showAltButton = screen.getByRole("button", { name: /show alternative answers/i });
    fireEvent.click(showAltButton);

    // Click the button again to hide alternative answers
    fireEvent.click(screen.getByRole("button", { name: /hide alternative answers/i }));

    // Ensure alternative answers are no longer displayed
    expect(screen.queryByText("Alternative answer 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Alternative answer 2")).not.toBeInTheDocument();
  });
});
