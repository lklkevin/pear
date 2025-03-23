import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SessionProvider } from "next-auth/react";
import GenerateLayout from "../generateLayout";

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

// Mock for Navbar to isolate the layout test
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);

describe("GenerateLayout component", () => {
  test("renders Navbar and children", () => {
    render(
      <SessionProvider session={dummySession}>
        <GenerateLayout>
          <div data-testid="child-content">Page Content</div>
        </GenerateLayout>
      </SessionProvider>
    );

    // Verify that the Navbar is rendered.
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    // Verify that the children are rendered.
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});
