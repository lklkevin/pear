import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CTA from "../cta";

// Mock Next.js Link to render a simple anchor element
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="cta-link">{children}</a>
  );
});

describe("CTA component", () => {
  test("renders the CTA button with correct text", () => {
    render(<CTA />);

    // Ensure the button is rendered with correct text
    expect(screen.getByRole("button", { name: /try now for free/i })).toBeInTheDocument();
  });

  test("button navigates to /generate", () => {
    render(<CTA />);

    // Ensure the link has the correct href
    expect(screen.getByTestId("cta-link")).toHaveAttribute("href", "/generate");
  });

  test("renders the arrow_forward icon", () => {
    render(<CTA />);

    // Ensure the icon is present
    expect(screen.getByText("arrow_forward")).toBeInTheDocument();
  });
});
