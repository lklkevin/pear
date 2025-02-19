import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../landingPage";

// Mock child components to simplify testing
jest.mock("../../layout/landingLayout", () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="landing-layout">{children}</div>
));

jest.mock("../graphic", () => () => <div data-testid="graphic">Graphic</div>);

describe("Home component", () => {
  test("renders main headings correctly", () => {
    render(<Home />);

    // Ensure the headings are present
    expect(screen.getByRole("heading", { name: /custom practice tests,/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /built instantly from your exams/i })).toBeInTheDocument();
    
    // Ensure the subheading is present
    expect(screen.getByText(/AI-powered, tailored math practice—built just for you./i)).toBeInTheDocument();
  });

  test("renders inside LandingLayout", () => {
    render(<Home />);

    // Ensure LandingLayout wraps the content
    expect(screen.getByTestId("landing-layout")).toBeInTheDocument();
  });

  test("renders the Graphic component", () => {
    render(<Home />);

    // Ensure the Graphic component is present
    expect(screen.getByTestId("graphic")).toBeInTheDocument();
  });
});
