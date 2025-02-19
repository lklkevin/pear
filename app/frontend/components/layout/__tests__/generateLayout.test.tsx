import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GenerateLayout from "../generateLayout";

// Mock Framer Motion to prevent animation-related test issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

// Mock child components to isolate testing to GenerateLayout
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);
jest.mock("../sideBar", () => ({ isCollapsed, setIsCollapsed, children }: { isCollapsed: boolean, setIsCollapsed: (value: boolean) => void, children: React.ReactNode }) => (
  <aside data-testid="sidebar" data-collapsed={isCollapsed}>
    <button onClick={() => setIsCollapsed(!isCollapsed)}>Toggle Sidebar</button>
    {children}
  </aside>
));
jest.mock("../../sidebar/infoCard", () => ({ number, mainText, text }: { number: number; mainText: string; text: string }) => (
  <div data-testid="info-card">
    <h3>{`${number}. ${mainText}`}</h3>
    <p>{text}</p>
  </div>
));

describe("GenerateLayout component", () => {
  test("renders the Navbar", () => {
    render(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    // Ensure Navbar is present
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  test("renders the Sidebar", () => {
    render(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    // Ensure Sidebar is present
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  test("renders the 'Getting Started' heading inside the Sidebar", () => {
    render(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    // Ensure the heading "Getting Started" is present
    expect(screen.getByRole("heading", { name: /getting started/i })).toBeInTheDocument();
  });

  test("renders the correct number of InfoCards inside the Sidebar", () => {
    render(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    // Ensure the correct number of InfoCards are rendered (4 expected)
    expect(screen.getAllByTestId("info-card")).toHaveLength(4);
  });

  test("renders children inside the main content area", () => {
    render(<GenerateLayout><div data-testid="child-content">Page Content</div></GenerateLayout>);

    // Ensure the child content is displayed
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  test("toggles Sidebar visibility when clicked", () => {
    render(<GenerateLayout><div>Page Content</div></GenerateLayout>);

    // Get sidebar and toggle button
    const sidebar = screen.getByTestId("sidebar");
    const toggleButton = screen.getByRole("button", { name: /toggle sidebar/i });

    // Initially, the sidebar should be collapsed
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    // Click to expand sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    // Click again to collapse sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
  });
});
