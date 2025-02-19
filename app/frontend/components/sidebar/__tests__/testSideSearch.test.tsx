import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SideSearch from "../testSideSearch";

// Mock Next.js Link to render a simple anchor element
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="exam-link">{children}</a>
  );
});

describe("SideSearch component", () => {
  test("renders the search bar", () => {
    render(<SideSearch />);

    // Ensure the search input is rendered
    expect(screen.getByPlaceholderText(/search exams/i)).toBeInTheDocument();
  });

  test("renders tabs and allows switching", () => {
    render(<SideSearch />);

    // Get all tab buttons
    const tabs = ["My Exams", "Popular", "Favorites", "Explore"];
    
    tabs.forEach((tab) => {
      expect(screen.getByRole("button", { name: tab })).toBeInTheDocument();
    });

    // Click on "Popular" tab
    fireEvent.click(screen.getByRole("button", { name: /popular/i }));

    // Ensure "Popular" is now the active tab
    expect(screen.getByRole("button", { name: /popular/i })).toHaveClass(
      "text-white border-b-2 border-emerald-500"
    );

    // Ensure "My Exams" is no longer active
    expect(screen.getByRole("button", { name: /my exams/i })).toHaveClass(
      "text-zinc-400 hover:text-white"
    );
  });

  test("renders exam list with correct number of items", () => {
    render(<SideSearch />);

    // Ensure the expected number of exams is rendered
    const exams = screen.getAllByTestId("exam-link");
    expect(exams.length).toBe(9);
  });

  test("exam links navigate to /exam", () => {
    render(<SideSearch />);

    // Ensure each exam link has the correct href attribute
    screen.getAllByTestId("exam-link").forEach((link) => {
      expect(link).toHaveAttribute("href", "/exam");
    });
  });

  test("renders colored indicators correctly", () => {
    render(<SideSearch />);

    // Get all color indicators
    const colorIndicators = screen.getAllByRole("button").filter(
      (btn) => btn.querySelector("div")?.className.includes("rounded-full")
    );

    expect(colorIndicators.length).toBe(9); // There should be 9 exams, each with a color indicator
  });
});
