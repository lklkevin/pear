import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../loginForm";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

// Mocks
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
}));

// First, declare a mock outside so it's shared
const mockSetSuccess = jest.fn();
const mockSetError = jest.fn();

// Then mock the store properly
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

describe("Login component", () => {
  const push = jest.fn();
  const setError = require("../../../store/store").useErrorStore.getState()
    .setError;
  const setSuccess = require("../../../store/store").useSuccStore().setSuccess;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push,
    });
  });

  test("redirects if session exists", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({
      data: { user: { email: "test@example.com" } },
      status: "authenticated",
    });

    render(<Login />);
    expect(push).toHaveBeenCalledWith("/");
  });

  test("clicking close button triggers router.push", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<Login />);
    const closeBtn = screen.getByRole("button", { name: "" }); // it's an unlabeled icon button
    fireEvent.click(closeBtn);
    expect(push).toHaveBeenCalledWith("/");
  });

  test("submits login form successfully", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });

    (signIn as jest.Mock).mockResolvedValue({ error: undefined }); // ✅ fix here

    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith("credentials", {
        email: "user@example.com",
        password: "password123",
        redirect: false,
      });
      expect(mockSetSuccess).toHaveBeenCalledWith(
        "Welcome back, user@example.com"
      );
      expect(push).toHaveBeenCalledWith("/");
    });
  });

  test("handles login error", async () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });
    (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

    render(<Login />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "fail@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "badpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  test("Google login button calls signIn", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<Login />);
    const googleBtn = screen.getByRole("button", {
      name: /continue with google/i,
    });
    fireEvent.click(googleBtn);
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/" });
  });
});
