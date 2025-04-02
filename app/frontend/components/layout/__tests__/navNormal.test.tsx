import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navbar from "../navNormal";
import { useSession, getSession } from "next-auth/react";
import { useUserStore } from "../../../store/user";

// ----------------------------
// Mocks
// ----------------------------

const mockPush = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/",
    pathname: "/",
    push: mockPush,
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("../../../store/user", () => ({
  useUserStore: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("../../ui/buttonGreen", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

jest.mock("../../ui/buttonGray", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

jest.mock("../../ui/menuToggle", () => ({
  MenuToggle: ({ toggle }: { toggle: () => void }) => (
    <button onClick={toggle}>Menu</button>
  ),
}));

jest.mock("../../account/userDropdown", () => ({
  __esModule: true,
  default: ({ username }: { username: string }) => (
    <div data-testid="user-dropdown">{username}</div>
  ),
}));

jest.mock("../mobileMenu", () => ({
  __esModule: true,
  default: ({ username }: { username: string }) => (
    <div data-testid="mobile-menu">{username}</div>
  ),
}));

// ----------------------------
// Shared Setup
// ----------------------------

const defaultStore = {
  username: "tester",
  setUsername: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (useUserStore as unknown as jest.Mock).mockReturnValue(defaultStore);
});

// ----------------------------
// Tests
// ----------------------------

describe("Navbar (NavNormal)", () => {
  test("renders main navigation links", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Navbar />);
    expect(screen.getByRole("link", { name: /browse/i })).toHaveAttribute(
      "href",
      "/browse"
    );
    expect(screen.getByRole("link", { name: /generate/i })).toHaveAttribute(
      "href",
      "/generate"
    );
  });

  test("renders logo link", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Navbar />);
    expect(screen.getByRole("link", { name: "pear" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  test("shows login/signup buttons when not authenticated", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Navbar />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("shows user avatar when session and username exist", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: "user@pear.com" } },
      status: "authenticated",
    });

    render(<Navbar />);
    expect(screen.getByText("T")).toBeInTheDocument(); // "T" from "tester"
  });

  test("shows skeleton if session exists but no username", () => {
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      username: "",
      setUsername: jest.fn(),
    });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: "user@pear.com" } },
      status: "authenticated",
    });

    render(<Navbar />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  test("opens user dropdown on avatar click", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: "user@pear.com" } },
      status: "authenticated",
    });

    render(<Navbar />);
    fireEvent.click(screen.getByText("T")); // avatar
    await waitFor(() => {
      expect(screen.getByTestId("user-dropdown")).toBeInTheDocument();
    });
  });

  test("toggles mobile menu when menu icon is clicked", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    render(<Navbar />);
    fireEvent.click(screen.getByText("Menu"));

    await waitFor(() => {
      expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    });
  });

  test("applies correct styles when 'landing' is true", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { container } = render(<Navbar landing={true} />);
    expect(container.firstChild).toHaveClass("sticky");
  });

  test("renders correctly when session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<Navbar />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });
});
