import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthLayout from "../authLayout";

describe("AuthLayout component", () => {
  test("renders the layout with provided text", () => {
    render(<AuthLayout text="Sign In Page"><div>Child Component</div></AuthLayout>);

    // Ensure the heading is displayed correctly
    expect(screen.getByRole("heading", { name: /sign in page/i })).toBeInTheDocument();
  });

  test("renders children inside the layout", () => {
    render(<AuthLayout text="Sign Up Page"><div data-testid="child-component">Child Content</div></AuthLayout>);

    // Ensure the child component is rendered
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
  });

  test("renders correct class structure", () => {
    render(<AuthLayout text="Test Page"><div>Content</div></AuthLayout>);

    // Check for top-level layout structure
    expect(screen.getByRole("heading", { name: /test page/i })).toHaveClass("text-lg font-semibold");

    // Ensure the container div has the correct class
    expect(screen.getByText(/test page/i).closest("div")).toHaveClass("grid place-items-center -mx-10 -my-6 bg-zinc-800 p-4 rounded-t-xl mb-4 h-20");
  });
});
