import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import GenerateLayout from "../generatedLayout";

// Mock Next.js router to prevent "NextRouter was not mounted" errors
jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  getSession: () => Promise.resolve(null),
}));

// Mock Next.js App Router hooks
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the Generated component if it's not already mocked.
jest.mock("../../sidebar/newUser", () => () => (
  <div data-testid="generated">Generated Component</div>
));

// Mock the BaseLayout component
jest.mock("../sidebarLayout", () => {
  return function MockBaseLayout({
    sidebarContent,
    children,
  }: {
    sidebarContent: React.ReactNode;
    children: React.ReactNode;
  }) {
    const [collapsed, setCollapsed] = React.useState(true);
    return (
      <div>
        <aside data-testid="sidebar" data-collapsed={collapsed.toString()}>
          {sidebarContent}
          <button onClick={() => setCollapsed(!collapsed)}>
            Toggle Sidebar
          </button>
        </aside>
        <main data-testid="content">{children}</main>
      </div>
    );
  };
});
// --- End of BaseLayout mock ---

describe("GenerateLayout component", () => {
  test("renders sidebar content with heading and Generated component", () => {
    render(
      <GenerateLayout>
        <div>Test Children</div>
      </GenerateLayout>
    );

    // Verify that the sidebar heading is rendered
    const heading = screen.getByRole("heading", { name: /saving & sharing/i });
    expect(heading).toBeInTheDocument();

    // Verify that the Generated component is rendered inside the sidebar
    const generated = screen.getByTestId("generated");
    expect(generated).toBeInTheDocument();
  });

  test("renders children inside the main content area", () => {
    render(
      <GenerateLayout>
        <div data-testid="child-content">Child Content</div>
      </GenerateLayout>
    );

    // Verify that children passed to GenerateLayout are rendered
    const child = screen.getByTestId("child-content");
    expect(child).toBeInTheDocument();
  });

  test("toggles sidebar collapse state when toggle button is clicked", () => {
    render(
      <GenerateLayout>
        <div>Test Content</div>
      </GenerateLayout>
    );

    // Get the sidebar element by its test id.
    const sidebar = screen.getByTestId("sidebar");
    // Get the toggle button by its accessible name (e.g., "Toggle Sidebar")
    const toggleButton = screen.getByRole("button", {
      name: /toggle sidebar/i,
    });

    // Check that initially the sidebar is collapsed (data-collapsed="true")
    expect(sidebar).toHaveAttribute("data-collapsed", "true");

    // Click to expand the sidebar.
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "false");

    // Click again to collapse the sidebar.
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute("data-collapsed", "true");
  });
});
