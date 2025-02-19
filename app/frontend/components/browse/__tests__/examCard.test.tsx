import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExamCard from "../examCard";

describe("ExamCard component", () => {
  const mockExam = {
    color: "linear-gradient(to right, #ff7e5f, #feb47b)", // Mock gradient color
    title: "Sample Exam",
    author: "John Doe",
  };

  test("renders the exam title and author", () => {
    render(<ExamCard exam={mockExam} />);
    
    // Ensure the exam title is rendered
    expect(screen.getByText("Sample Exam")).toBeInTheDocument();

    // Ensure the exam author is rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("applies background color correctly", () => {
    const { container } = render(<ExamCard exam={mockExam} />);

    // Ensure the div has inline style with the correct background color
    expect(container.firstChild).toHaveStyle(`background: ${mockExam.color}`);
  });
});
