import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserDropdown from "../userDropdown";
import { useSession } from "next-auth/react";
import signOutWithBackend from "../../../utils/signOut";

// Mocks
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("../../../utils/signOut", () => jest.fn());

jest.mock("../accountModal", () => (props: any) => {
  return props.show ? (
    <div data-testid="account-modal">
      AccountModal Open - {props.username} - {props.email}
      <button onClick={props.closeModal}>Close Modal</button>
    </div>
  ) : null;
});

describe("UserDropdown", () => {
  const defaultProps = {
    username: "TestUser",
    email: "test@example.com",
    setUsername: jest.fn(),
    closeMenu: jest.fn(),
    setShowPwdModal: jest.fn(),
    showPwdModal: false,
    setShowModal: jest.fn(),
    showModal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { refreshToken: "fake-refresh-token" },
    });
  });

  test("renders username and email", () => {
    render(<UserDropdown {...defaultProps} />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  test("opens AccountModal when 'Account' is clicked", () => {
    render(<UserDropdown {...defaultProps} />);
    const accountButton = screen.getByRole("button", { name: /account/i });
    fireEvent.click(accountButton);
    expect(defaultProps.setShowModal).toHaveBeenCalledWith(true);
  });

  test("calls signOutWithBackend and closeMenu on logout", () => {
    render(<UserDropdown {...defaultProps} />);
    const logoutButton = screen.getByRole("button", { name: /log out/i });
    fireEvent.click(logoutButton);
    expect(signOutWithBackend).toHaveBeenCalledWith("fake-refresh-token");
    expect(defaultProps.closeMenu).toHaveBeenCalled();
  });

  test("closes AccountModal properly and triggers closeMenu", () => {
    render(<UserDropdown {...defaultProps} showModal={true} />);
    expect(screen.getByTestId("account-modal")).toBeInTheDocument();
    const closeBtn = screen.getByText(/close modal/i);
    fireEvent.click(closeBtn);
    expect(defaultProps.setShowModal).toHaveBeenCalledWith(false);
    expect(defaultProps.closeMenu).toHaveBeenCalled();
  });
});
