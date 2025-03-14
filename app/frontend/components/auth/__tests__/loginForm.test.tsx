import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../loginForm";
import { useRouter } from "next/router";

// Mock next/router so that useRouter works without a provider.
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth so that useSession and signIn work without a SessionProvider.
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: jest.fn(),
}));

describe("Login component", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: jest.fn(),
    });
  });

  test("renders email and password fields and login button", () => {
    render(<Login />);
    // Check that the email input field is rendered.
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Check that the password input field is rendered.
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    // Check that the login button is rendered.
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("renders Google login button", () => {
    render(<Login />);
    // Check that the Google login button is rendered.
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  test("renders sign-up link", () => {
    render(<Login />);
    // Check that the sign-up link is rendered and points to a signup URL.
    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute(
      "href",
      expect.stringContaining("/signup")
    );
  });
});
