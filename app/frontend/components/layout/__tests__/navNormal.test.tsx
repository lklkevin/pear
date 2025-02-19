import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NavNormal from "../navNormal";
import ButtonG from "../../ui/buttonGreen";
import Button from "../../ui/buttonGray";
import { useRouter } from "next/router";
import Link from "next/link";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock Button components
jest.mock("../../ui/buttonGreen", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

jest.mock("../../ui/buttonGray", () => ({
  __esModule: true,
  default: ({ text }: { text: string }) => <button>{text}</button>,
}));

describe("NavNormal component", () => {
  test("renders navigation links correctly", () => {
    render(<NavNormal />);

    // Check for navigation links
    expect(screen.getByRole("link", { name: /browse/i })).toHaveAttribute("href", "/browse");
    expect(screen.getByRole("link", { name: /generate/i })).toHaveAttribute("href", "/generate");
    expect(screen.getByRole("link", { name: /pricing/i })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");

    // Ensure login and sign-up buttons exist
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("renders the logo link", () => {
    render(<NavNormal />);
    const logoLink = screen.getByRole("link", { name: "" }); // The logo doesn't have text
    expect(logoLink).toHaveAttribute("href", "/");
  });

  test("applies border class when 'landing' prop is false", () => {
    const { container } = render(<NavNormal landing={false} />);
    expect(container.firstChild).toHaveClass("border-b border-zinc-800");
  });

  test("does not apply border class when 'landing' prop is true", () => {
    const { container } = render(<NavNormal landing={true} />);
    expect(container.firstChild).not.toHaveClass("border-b border-zinc-800");
  });
});
