import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import AccountModal from "../accountModal";
import { useSession } from "next-auth/react";

// Mock session
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock portal creation
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock input
jest.mock("../../form/inputField", () => (props: any) => (
  <input
    data-testid="username-input"
    value={props.value}
    onChange={props.onChange}
  />
));

// Mock stores
const setError = jest.fn();
const setSuccess = jest.fn();
jest.mock("../../../store/store", () => ({
  useErrorStore: () => ({ setError }),
  useSuccStore: () => ({ setSuccess }),
}));

// Mock signOutWithBackend
jest.mock("../../../utils/signOut", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("AccountModal", () => {
  const mockCloseModal = jest.fn();
  const mockSetShowPwdModal = jest.fn();
  const mockOnUsernameUpdated = jest.fn();

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        accessToken: "mock-token",
        refreshToken: "mock-refresh",
        auth_provider: "local",
        user: { email: "test@example.com" },
      },
    });

    jest.clearAllMocks();
    // @ts-ignore
    global.fetch = undefined;
  });

  const defaultProps = {
    email: "test@example.com",
    username: "testuser",
    show: true,
    closeModal: mockCloseModal,
    onUsernameUpdated: mockOnUsernameUpdated,
    setShowPwdModal: mockSetShowPwdModal,
    showPwdModal: false,
  };

  test("renders modal with email and username input", () => {
    render(<AccountModal {...defaultProps} />);
    expect(screen.getByText(/my profile/i)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.email)).toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
  });

  test("calls setShowPwdModal when change password is clicked", () => {
    render(<AccountModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /change password/i }));
    expect(mockSetShowPwdModal).toHaveBeenCalledWith(true);
  });

  test("renders delete confirmation flow", () => {
    render(<AccountModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    expect(
      screen.getByText(/are you sure you want to permanently delete/i)
    ).toBeInTheDocument();
  });

  test("calls closeModal when background is clicked", () => {
    const { container } = render(<AccountModal {...defaultProps} />);
    fireEvent.click(container.firstChild as Element);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  test("allows canceling delete confirmation", () => {
    render(<AccountModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(
      screen.queryByText(/are you sure you want to permanently delete/i)
    ).not.toBeInTheDocument();
  });

  test("disables save button when username is unchanged", () => {
    render(<AccountModal {...defaultProps} />);
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  test("enables save button when username changes", () => {
    render(<AccountModal {...defaultProps} />);
    const input = screen.getByTestId("username-input");
    fireEvent.change(input, { target: { value: "newname" } });
    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeEnabled();
  });

  test("updates username successfully", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "newname", message: "Updated" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "newname" }),
      });

    render(<AccountModal {...defaultProps} />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "newname" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockOnUsernameUpdated).toHaveBeenCalledWith("newname");
    });
  });

  test("falls back to PATCH response username if profile fetch fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: "patchName", message: "Updated" }),
      })
      .mockResolvedValueOnce({ ok: false });

    render(<AccountModal {...defaultProps} />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "patchName" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockOnUsernameUpdated).toHaveBeenCalledWith("patchName");
    });
  });

  test("handles username update failure", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Update failed" }),
    });

    render(<AccountModal {...defaultProps} />);
    fireEvent.change(screen.getByTestId("username-input"), {
      target: { value: "fail" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Update failed");
    });
  });

  test("deletes account successfully", async () => {
    const signOutWithBackend = require("../../../utils/signOut").default;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Deleted" }),
    });

    render(<AccountModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));

    await waitFor(() => {
      expect(signOutWithBackend).toHaveBeenCalled();
    });
  });

  test("handles delete account error", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Delete error" }),
    });

    render(<AccountModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith("Delete error");
    });
  });

  test("renders PasswordModal when showPwdModal is true", () => {
    render(<AccountModal {...defaultProps} showPwdModal={true} />);
    expect(screen.getByText(/change password/i)).toBeInTheDocument();
  });
});
