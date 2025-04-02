import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PasswordModal from "../passwordModal";
import { useSession } from "next-auth/react";

// Mock session
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock createPortal to avoid dealing with actual DOM portal logic in tests
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock password field component
jest.mock("../../form/passwordField", () => (props: any) => (
  <input
    type="password"
    value={props.value}
    onChange={props.onChange}
    data-testid={props.id}
  />
));

// Mock stores
const setError = jest.fn();
const setSuccess = jest.fn();
jest.mock("../../../store/store", () => ({
  useErrorStore: () => ({ setError }),
  useSuccStore: () => ({ setSuccess }),
}));

describe("PasswordModal", () => {
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { accessToken: "fake-token" },
    });
  });

  const defaultProps = {
    show: true,
    closeModal: mockCloseModal,
  };

  test("renders and accepts input", () => {
    render(<PasswordModal {...defaultProps} />);
    expect(screen.getByText(/change password/i)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("old-password"), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByTestId("new-password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByTestId("confirm-new-password"), {
      target: { value: "newpass123" },
    });

    expect(screen.getByTestId("old-password")).toHaveValue("oldpass");
    expect(screen.getByTestId("new-password")).toHaveValue("newpass123");
    expect(screen.getByTestId("confirm-new-password")).toHaveValue(
      "newpass123"
    );
  });

  test("closes when clicking close button", () => {
    render(<PasswordModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockCloseModal).toHaveBeenCalled();
  });

  test("closes when clicking backdrop", () => {
    const { container } = render(<PasswordModal {...defaultProps} />);
    fireEvent.click(container.firstChild as Element); // backdrop
    expect(mockCloseModal).toHaveBeenCalled();
  });

  test("shows error if new password is empty", async () => {
    render(<PasswordModal {...defaultProps} />);
    fireEvent.change(screen.getByTestId("old-password"), {
      target: { value: "oldpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() =>
      expect(setError).toHaveBeenCalledWith("New password cannot be empty.")
    );
  });

  test("shows error if passwords do not match", async () => {
    render(<PasswordModal {...defaultProps} />);
    fireEvent.change(screen.getByTestId("old-password"), {
      target: { value: "oldpass" },
    });
    fireEvent.change(screen.getByTestId("new-password"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByTestId("confirm-new-password"), {
      target: { value: "mismatch" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /update password/i }));
    await waitFor(() =>
      expect(setError).toHaveBeenCalledWith("New passwords do not match.")
    );
  });
});
