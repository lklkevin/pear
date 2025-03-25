import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SessionProvider } from "next-auth/react";
import GenerateLayout from "../generateLayout";

// Mocks for router/navigation hooks
jest.mock("next/router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock for Navbar to isolate the layout test
jest.mock("../navNormal", () => () => <nav data-testid="navbar">Navbar</nav>);

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
    // Since the layout renders the children twice (for responsive design), expect two elements.
    const childContents = screen.getAllByTestId("child-content");
    expect(childContents.length).toBe(2);
  });
});
