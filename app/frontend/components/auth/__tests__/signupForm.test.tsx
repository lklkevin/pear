import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Signup from "../signupForm";
import { useRouter } from "next/router";

// Mock Next.js router so useRouter works.
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth so that useSession and getSession work without a SessionProvider.
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: () => Promise.resolve(null),
}));

describe("Signup component", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: jest.fn(),
    });
  });

  test("renders email, username, and password input fields", () => {
    render(<Signup />);
    // Check that the email input is rendered.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Check that the username input is rendered.
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    // For the password field, query the DOM for an input of type "password"
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });

  test("renders sign-up button", () => {
    render(<Signup />);
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("renders Google sign-up button", () => {
    render(<Signup />);
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  test("renders login link", () => {
    render(<Signup />);
    const loginLink = screen.getByRole("link", { name: /log in/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.getAttribute("href")).toEqual(
      expect.stringContaining("/login")
    );
  });
});
