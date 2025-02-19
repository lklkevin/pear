import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Signup from "../signupForm";
import { useRouter } from "next/router";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Signup component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test("renders email, username input fields", () => {
    render(<Signup />);

    // Ensure input fields are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  test("renders sign-up button", () => {
    render(<Signup />);
    
    // Ensure the sign-up button is rendered
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("renders Google sign-up button", () => {
    render(<Signup />);
    
    // Ensure the Google sign-up button is present
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("renders login link", () => {
    render(<Signup />);

    // Ensure login link is rendered
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });
});
