import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MobileMenu from "../mobileMenu";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import signOutWithBackend from "../../../utils/signOut";

// Mocks
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../utils/signOut", () => jest.fn());

jest.mock(
  "../../account/accountModal",
  () => (props: any) =>
    props.show ? <div data-testid="account-modal">Account Modal</div> : null
);

jest.mock("../../ui/skeleton", () => ({
  Skeleton: (props: any) => <div data-testid="skeleton" {...props} />,
}));

describe("MobileMenu", () => {
  const baseProps = {
    username: "John",
    email: "john@example.com",
    mobileMenuOpen: true,
    setMobileMenuOpen: jest.fn(),
    setUsername: jest.fn(),
    setShowPwdModal: jest.fn(),
    showPwdModal: false,
    setShowModal: jest.fn(),
    showModal: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      pathname: "/browse",
      asPath: "/browse",
    });
  });

  test("renders Browse and Generate links", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    render(<MobileMenu {...baseProps} />);
    expect(screen.getByText("Browse")).toBeInTheDocument();
    expect(screen.getByText("Generate")).toBeInTheDocument();
  });

  test("renders Login link when unauthenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });
    render(<MobileMenu {...baseProps} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders Account and Logout when authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { refreshToken: "fake-token" },
      status: "authenticated",
    });
    render(<MobileMenu {...baseProps} />);
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("calls setShowModal when Account button clicked", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { refreshToken: "fake-token" },
      status: "authenticated",
    });
    render(<MobileMenu {...baseProps} />);
    fireEvent.click(screen.getByText("Account"));
    expect(baseProps.setShowModal).toHaveBeenCalledWith(true);
  });

  test("calls signOutWithBackend and setMobileMenuOpen on Logout", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { refreshToken: "abc123" },
      status: "authenticated",
    });
    render(<MobileMenu {...baseProps} />);
    fireEvent.click(screen.getByText("Logout"));
    expect(signOutWithBackend).toHaveBeenCalledWith("abc123");
    expect(baseProps.setMobileMenuOpen).toHaveBeenCalledWith(false);
  });

  test("renders skeleton when session status is loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });
    render(<MobileMenu {...baseProps} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  test("renders AccountModal when showModal is true", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { refreshToken: "token" },
      status: "authenticated",
    });
    render(<MobileMenu {...baseProps} showModal={true} />);
    expect(screen.getByTestId("account-modal")).toBeInTheDocument();
  });
});
