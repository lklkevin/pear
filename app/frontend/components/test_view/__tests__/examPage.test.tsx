import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "../examPage";

// Mock ExamLayout to isolate testing of Page component
jest.mock("../../layout/examLayout", () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="exam-layout">{children}</div>
));

// Mock ExamContent to isolate rendering behavior
jest.mock("../examContent", () => ({ exam }: { exam: any }) => (
  <div data-testid="exam-content">Exam Title: {exam.title}</div>
));

// Mock sample exam data
jest.mock("../sampleExam", () => ({
  sampleExam: {
    id: "sample-exam-1",
    title: "Sample Exam",
    description: "This is a sample exam description.",
    isPublic: true,
    questions: [],
  },
}));

describe("Page component", () => {
  test("renders the ExamLayout", () => {
    render(<Page />);

    // Ensure ExamLayout is rendered
    expect(screen.getByTestId("exam-layout")).toBeInTheDocument();
  });

  test("renders the ExamContent with the sampleExam data", () => {
    render(<Page />);

    // Ensure ExamContent is rendered with correct title
    expect(screen.getByTestId("exam-content")).toHaveTextContent("Exam Title: Sample Exam");
  });
});
