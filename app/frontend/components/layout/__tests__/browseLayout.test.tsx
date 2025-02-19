import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrowseLayout from "../browseLayout";

// Mock the Nav component to isolate the test to BrowseLayout
jest.mock("../navNormal", () => () => <nav data-testid="nav-component">Navigation</nav>);

describe("BrowseLayout component", () => {
  test("renders the Nav component", () => {
    render(<BrowseLayout><div>Page Content</div></BrowseLayout>);

    // Ensure the Nav component is rendered
    expect(screen.getByTestId("nav-component")).toBeInTheDocument();
  });

  test("renders children inside the layout", () => {
    render(<BrowseLayout><div data-testid="child-component">Page Content</div></BrowseLayout>);

    // Ensure the child content is rendered
    expect(screen.getByTestId("child-component")).toBeInTheDocument();
    expect(screen.getByText(/page content/i)).toBeInTheDocument();
  });

  test("renders correct layout structure", () => {
    render(<BrowseLayout><div>Content</div></BrowseLayout>);

    // Check if the outer div has the correct class
    expect(screen.getByRole("main").parentElement).toHaveClass("min-h-screen bg-zinc-950 text-white");

    // Ensure the main container has correct padding
    expect(screen.getByRole("main")).toHaveClass("px-10 py-6");
  });
});
