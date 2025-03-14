import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GenerateLayout from "../generateLayout";

// Mock for Navbar to isolate the layout test
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);

describe("GenerateLayout component", () => {
  test("renders Navbar and children", () => {
    render(
      <GenerateLayout>
        <div data-testid="child-content">Page Content</div>
      </GenerateLayout>
    );

    // Verify that the Navbar is rendered.
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    // Verify that the children are rendered.
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
