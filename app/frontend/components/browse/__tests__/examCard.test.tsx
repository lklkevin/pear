import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamCard from "../examCard";

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: () => Promise.resolve(null),
}));

describe("ExamCard component", () => {
  const mockExam = {
    exam_id: 1,
    name: "Sample Exam",
    date: "2023-01-01",
    color: "linear-gradient(to right, #ff7e5f, #feb47b)", // Mock gradient color
    description: "This is a sample exam description.",
    liked: false,
  };

  test("renders the exam title and date", () => {
    render(<ExamCard exam={mockExam} />);

    // Ensure the exam title is rendered
    expect(screen.getByText("Sample Exam")).toBeInTheDocument();
    // Ensure the exam date is rendered
    expect(screen.getByText("2023-01-01")).toBeInTheDocument();
  });

  test("applies background color correctly", () => {
    const { container } = render(<ExamCard exam={mockExam} />);
    // Ensure the div has inline style with the correct background gradient
    expect(container.firstChild).toHaveStyle(
      `background: linear-gradient(to bottom, ${mockExam.color},`
    );
  });
});
