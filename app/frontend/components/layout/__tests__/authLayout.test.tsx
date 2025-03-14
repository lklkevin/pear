import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthLayout from "../authLayout";

// Mock Next.js router to prevent "NextRouter was not mounted" errors
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("AuthLayout component", () => {
  test("renders children inside the layout", () => {
    render(
      <AuthLayout text="Sign In Page">
        <div data-testid="child">Child Content</div>
      </AuthLayout>
    );
    // Verify that the child content is rendered
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
  });
});
