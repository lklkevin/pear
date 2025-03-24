import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GenerateLayout from "../generateLayout";

// Mock Framer Motion to prevent animation-related issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
    }: {
      children?: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
}));

// Mock Navbar to isolate layout tests
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);

// Mock Sidebar with toggle functionality (if used elsewhere)
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
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          Toggle Sidebar
        </button>
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

// Mock BaseLayout component to isolate layout tests
jest.mock("../sidebarLayout", () => {
  return function MockBaseLayout({
    sidebarContent,
    otherContent,
    children,
  }: {
    sidebarContent: React.ReactNode;
    otherContent: React.ReactNode;
    children: React.ReactNode;
  }) {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
      <div>
        {/* Render a mocked Navbar */}
        <div data-testid="navbar">Navbar</div>
        <aside data-testid="sidebar" data-collapsed={collapsed.toString()}>
          {sidebarContent}
          <button onClick={() => setCollapsed(!collapsed)}>
            Toggle Sidebar
          </button>
        </aside>
        <div data-testid="footer">{otherContent}</div>
        <main data-testid="content">{children}</main>
      </div>
    );
  };
});

// Also, ensure Next.js router and navigation hooks are mocked:
jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Remove SessionProvider and simply return an unauthenticated session.
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: () => Promise.resolve(null),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("GenerateLayout component", () => {
  const renderComponent = (component: React.ReactNode) => {
    return render(component);
  };

  test("renders the Navbar", () => {
    renderComponent(
      <GenerateLayout>
        <div>Page Content</div>
      </GenerateLayout>
    );
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("renders the Sidebar", () => {
    renderComponent(
      <GenerateLayout>
        <div>Page Content</div>
      </GenerateLayout>
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("renders the 'Getting Started' heading inside the Sidebar", () => {
    renderComponent(
      <GenerateLayout>
        <div>Page Content</div>
      </GenerateLayout>
    );
    // The GenerateLayout provides a heading "Getting Started" in its sidebarContent.
    expect(
      screen.getByRole("heading", { name: /getting started/i })
    ).toBeInTheDocument();
  });

  test("renders the correct number of InfoCards inside the Sidebar", () => {
    renderComponent(
      <GenerateLayout>
        <div>Page Content</div>
      </GenerateLayout>
    );
    // There are 4 steps defined in GenerateLayout.
    const infoCards = screen.getAllByTestId("info-card");
    expect(infoCards.length).toBe(4);
  });

  test("renders children inside the main content area", () => {
    renderComponent(
      <GenerateLayout>
        <div data-testid="child-content">Page Content</div>
      </GenerateLayout>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  test("toggles Sidebar visibility when clicked", () => {
    renderComponent(
      <GenerateLayout>
        <div>Page Content</div>
      </GenerateLayout>
    );
    const sidebar = screen.getByTestId("sidebar");
    const toggleButton = screen.getByRole("button", {
      name: /toggle sidebar/i,
    });

    // Initially, sidebar should be collapsed (data-collapsed="true")
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    // Click to expand the sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    // Click again to collapse the sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
  });
});
