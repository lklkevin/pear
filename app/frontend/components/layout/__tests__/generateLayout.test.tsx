import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SessionProvider } from "next-auth/react";
import GenerateLayout from "../generateLayout";

// Mock Framer Motion to prevent animation-related test issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// Mock Navbar to isolate layout tests
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);

// Mock Sidebar with toggle functionality
jest.mock("../sideBar", () => {
  return function MockSidebar({
    isCollapsed,
    setIsCollapsed,
    children,
  }: {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    children: React.ReactNode;
  }) {
    return (
      <aside data-testid="sidebar" data-collapsed={isCollapsed.toString()}>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>Toggle Sidebar</button>
        {children}
      </aside>
    );
  };
});

// Mock InfoCard component with dynamic props
jest.mock("../../sidebar/infoCard", () => {
  return function MockInfoCard({
    number,
    mainText,
    text,
  }: {
    number: number;
    mainText: string;
    text: string;
  }) {
    return (
      <div data-testid="info-card">
        <h3>{`${number}. ${mainText}`}</h3>
        <p>{text}</p>
      </div>
    );
  };
});

// Dummy session to avoid `useSession` errors
const dummySession = {
  user: {
    name: "John Doe",
    email: "johndoe@example.com",
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  accessToken: "dummy-access-token",
  refreshToken: "dummy-refresh-token",
  error: "",
};

describe("GenerateLayout component", () => {
  const renderWithSession = (component: React.ReactNode) =>
    render(<SessionProvider session={dummySession}>{component}</SessionProvider>);

  test("renders the Navbar", () => {
    renderWithSession(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("renders the Sidebar", () => {
    renderWithSession(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("renders the 'Getting Started' heading inside the Sidebar", () => {
    renderWithSession(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    expect(screen.getByRole("heading", { name: /getting started/i })).toBeInTheDocument();
  });

  test("renders the correct number of InfoCards inside the Sidebar", () => {
    renderWithSession(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    const infoCards = screen.getAllByTestId("info-card");
    expect(infoCards.length).toBeGreaterThan(0); // Ensure at least 1 card is rendered
  });

  test("renders children inside the main content area", () => {
    renderWithSession(
      <GenerateLayout>
        <div data-testid="child-content">Page Content</div>
      </GenerateLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  test("toggles Sidebar visibility when clicked", () => {
    renderWithSession(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    const sidebar = screen.getByTestId("sidebar");
    const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i });

    // Initially, check if the sidebar is collapsed
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    // Click to expand the sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    // Click again to collapse the sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
  });
});
