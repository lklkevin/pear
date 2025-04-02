import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CTA from "../components/landing/cta";
import Navbar from "../components/layout/navNormal";
import CtaSection from "../components/landing/ctaSection";
import { useRouter } from "next/router";

// Mock router push function
const push = jest.fn();

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth session
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

// Mock next/link to simulate navigation via `router.push`
jest.mock("next/link", () => {
  return ({ children, href }) => {
    return (
      <a href={href} onClick={() => push(href)} data-testid="mock-link">
        {children}
      </a>
    );
  };
});

describe("Landing page navigation", () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      push,
      pathname: "/",
      asPath: "/",
    });
    push.mockClear();
  });

  test("navigates to /generate when HeroSection CTA is clicked", () => {
    render(<CTA />);
    const ctaButton = screen.getByRole("button", { name: /try now for free/i });
    fireEvent.click(ctaButton);
    expect(push).toHaveBeenCalledWith("/generate");
  });

  test("navigates to /generate from navbar link", () => {
    render(<Navbar landing={true} />);
    const generateLink = screen.getByRole("link", { name: /generate/i });
    fireEvent.click(generateLink);
    expect(push).toHaveBeenCalledWith("/generate");
  });

  test("navigates to /generate from CTA section button", () => {
    render(<CtaSection />);
    const tryNowButton = screen.getByRole("button", { name: /try now/i });
    fireEvent.click(tryNowButton);
    expect(push).toHaveBeenCalledWith("/generate");
  });
});
