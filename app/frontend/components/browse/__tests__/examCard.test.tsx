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
    date: "2023-01-01 12:00",
    color: "linear-gradient(to right, #ff7e5f, #feb47b)", // Mock gradient color
    description: "This is a sample exam description.",
    liked: false,
  };

  test("renders the exam title and date", () => {
    // Mock the Date.UTC to return a consistent date for testing
    const originalDateUTC = Date.UTC;
    
    // Mock implementation of Date.UTC to return a fixed timestamp
    Date.UTC = jest.fn(() => new Date("2023-01-01T12:00:00Z").getTime());
    
    render(<ExamCard exam={mockExam} />);

    // Ensure the exam title is rendered
    expect(screen.getByText("Sample Exam")).toBeInTheDocument();
    
    // Get the formatted date according to the browser's timezone
    const localDate = new Date("2023-01-01T12:00:00Z");
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const expectedLocalDateStr = `${year}-${month}-${day} ${hours}:${minutes}`;
    
    // Ensure the formatted date is rendered
    expect(screen.getByText(expectedLocalDateStr)).toBeInTheDocument();
    
    // Restore original Date.UTC
    Date.UTC = originalDateUTC;
  });

  test("applies background color correctly", () => {
    const { container } = render(<ExamCard exam={mockExam} />);
    // Ensure the div has inline style with the correct background gradient
    expect(container.firstChild).toHaveStyle(
      `background: linear-gradient(to bottom, ${mockExam.color},`
    );
  });
});
