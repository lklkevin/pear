import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamGrid from "../examGrid";
import ExamCard from "../examCard";
import Link from "next/link";

// Mock the ExamCard component to simplify testing
jest.mock("../examCard", () => ({ exam }: { exam: { color: string; title: string; author: string } }) => (
  <div data-testid="exam-card">{exam.title}</div>
));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

describe("ExamGrid component", () => {
  const mockExams = [
    { color: "red", title: "Math Test", author: "Alice" },
    { color: "blue", title: "Physics Quiz", author: "Bob" },
    { color: "green", title: "History Exam", author: "Charlie" },
  ];

  test("renders the correct number of ExamCard components", () => {
    render(<ExamGrid exams={mockExams} />);

    // Ensure the correct number of ExamCard components are rendered
    expect(screen.getAllByTestId("exam-card")).toHaveLength(mockExams.length);
  });

  test("renders exam titles correctly", () => {
    render(<ExamGrid exams={mockExams} />);

    // Ensure each exam title appears in the document
    mockExams.forEach((exam) => {
      expect(screen.getByText(exam.title)).toBeInTheDocument();
    });
  });

  test("renders an empty grid when no exams are provided", () => {
    render(<ExamGrid exams={[]} />);

    // Ensure no ExamCards are rendered
    expect(screen.queryByTestId("exam-card")).not.toBeInTheDocument();
  });
});
