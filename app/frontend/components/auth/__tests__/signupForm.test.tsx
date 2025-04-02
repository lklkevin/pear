import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Signup from "../signupForm";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";

// Shared mocks
const mockPush = jest.fn();
const mockSetSuccess = jest.fn();
const mockSetError = jest.fn();

// External Mocks
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: jest.fn(),
  signIn: jest.fn(),
}));

jest.mock("../../../store/store", () => ({
  useErrorStore: {
    getState: () => ({
      setError: mockSetError,
    }),
  },
  useSuccStore: () => ({
    setSuccess: mockSetSuccess,
  }),
}));

global.fetch = jest.fn();

describe("Signup component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: mockPush,
    });
  });

  test("clicking close button redirects", () => {
    render(<Signup />);
    const closeBtn = screen.getByRole("button", { name: /close/i }); // it's unlabeled
    fireEvent.click(closeBtn);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("submits signup form successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    (signIn as jest.Mock).mockResolvedValueOnce({ error: undefined });

    render(<Signup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/signup"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            email: "test@example.com",
            username: "testuser",
            password: "password123",
          }),
        })
      );
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockSetSuccess).toHaveBeenCalledWith(
        "Account created and signed in successfully."
      );
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("handles backend signup error", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Email already in use" }),
    });

    render(<Signup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "tester" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith("Email already in use");
    });
  });

  test("handles auto-login error after signup", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    (signIn as jest.Mock).mockResolvedValueOnce({ error: "Invalid login" });

    render(<Signup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@fail.com" },
    });
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "userfail" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "failpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith("Invalid login");
    });
  });

  test("handles Google signup when not signed in", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    render(<Signup />);
    const googleBtn = screen.getByRole("button", {
      name: /continue with google/i,
    });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSetSuccess).toHaveBeenCalledWith("");
      expect(mockSetError).toHaveBeenCalledWith("");
      expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
    });
  });

  test("blocks Google signup when already signed in", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      user: { email: "already@in.com" },
    });
    render(<Signup />);
    fireEvent.click(
      screen.getByRole("button", { name: /continue with google/i })
    );

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith("You are already signed in!");
    });
  });
});
