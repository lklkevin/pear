import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GeneratePage from "../generatePage";

// Mock child components to simplify testing
jest.mock("../../layout/generateLayout", () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="generate-layout">{children}</div>
));

jest.mock("../examForm", () => () => <div data-testid="exam-form">ExamForm</div>);

describe("GeneratePage component", () => {
  test("renders the page title", () => {
    render(<GeneratePage />);
    
    // Ensure the heading is displayed
    expect(screen.getByRole("heading", { name: /create exam/i })).toBeInTheDocument();
  });

  test("renders the description text", () => {
    render(<GeneratePage />);
    
    // Ensure the description is displayed
    expect(
      screen.getByText(/simply upload your past exam and press generate/i)
    ).toBeInTheDocument();
  });

  test("renders the ExamForm component", () => {
    render(<GeneratePage />);
    
    // Ensure the ExamForm is rendered
    expect(screen.getByTestId("exam-form")).toBeInTheDocument();
  });

  test("renders inside the GenerateLayout", () => {
    render(<GeneratePage />);
    
    // Ensure everything is wrapped inside GenerateLayout
    expect(screen.getByTestId("generate-layout")).toBeInTheDocument();
  });
});
