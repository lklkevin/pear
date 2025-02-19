import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../loginForm";
import { useRouter } from "next/router";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Login component", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test("renders email and password input fields", () => {
    render(<Login />);

    // Ensure the email/username input field is present
    expect(screen.getByLabelText(/email \/ username/i)).toBeInTheDocument();

    // Ensure the password input field is present
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("renders login button", () => {
    render(<Login />);
    
    // Ensure the login button is rendered
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("renders Google login button", () => {
    render(<Login />);
    
    // Ensure the Google login button is present
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("renders sign-up link", () => {
    render(<Login />);

    // Ensure sign-up link is rendered
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
  });
});
