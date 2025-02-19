import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LandingLayout from "../landingLayout";

// Mock child components to isolate LandingLayout testing
jest.mock("../../layout/navNormal", () => ({ landing }: { landing: boolean }) => (
  <nav data-testid="nav-component" data-landing={landing}>Navbar</nav>
));

jest.mock("../../landing/glow", () => ({ className, background }: { className: string; background: string }) => (
  <div data-testid="glow-component" data-class={className} data-background={background}>Glow</div>
));

jest.mock("../../landing/cta", () => () => <div data-testid="cta-component">CTA</div>);

describe("LandingLayout component", () => {
  test("renders the Nav component with landing prop", () => {
    render(<LandingLayout><div>Page Content</div></LandingLayout>);

    // Ensure Navbar is present with landing prop
    expect(screen.getByTestId("nav-component")).toBeInTheDocument();
    expect(screen.getByTestId("nav-component")).toHaveAttribute("data-landing", "true");
  });

  test("renders two Glow components", () => {
    render(<LandingLayout><div>Page Content</div></LandingLayout>);

    // Ensure exactly 2 Glow components are rendered
    expect(screen.getAllByTestId("glow-component")).toHaveLength(2);
  });

  test("renders the CTA component", () => {
    render(<LandingLayout><div>Page Content</div></LandingLayout>);

    // Ensure CTA is present
    expect(screen.getByTestId("cta-component")).toBeInTheDocument();
  });

  test("renders children inside the main content area", () => {
    render(<LandingLayout><div data-testid="child-content">Page Content</div></LandingLayout>);

    // Ensure child content is rendered
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  test("renders correct layout structure", () => {
    render(<LandingLayout><div>Content</div></LandingLayout>);

    // Ensure the main container has the expected class
    expect(screen.getByRole("main")).toHaveClass("relative container w-screen mx-auto py-8 tracking-normal");
  });
});
