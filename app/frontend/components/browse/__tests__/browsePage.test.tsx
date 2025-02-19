import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BrowsePage from "../browsePage";

// Mock child components to simplify testing
jest.mock("../../layout/browseLayout", () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="browse-layout">{children}</div>
));

jest.mock("../../ui/tabs", () => ({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) => (
  <div data-testid="tabs">
    <button onClick={() => setActiveTab("My Exams")}>My Exams</button>
    <button onClick={() => setActiveTab("Popular")}>Popular</button>
    <button onClick={() => setActiveTab("Favorites")}>Favorites</button>
    <button onClick={() => setActiveTab("Explore")}>Explore</button>
  </div>
));

jest.mock("../../layout/searchBar", () => () => <div data-testid="search-bar">SearchBar</div>);

jest.mock("../examGrid", () => ({ exams }: { exams: { color: string; title: string; author: string }[] }) => (
  <div data-testid="exam-grid">{exams.length} exams</div>
));

describe("BrowsePage component", () => {
  test("renders correctly with the default active tab", () => {
    render(<BrowsePage />);

    // Ensure the main heading is rendered with the default tab title
    expect(screen.getByRole("heading", { name: /my exams/i })).toBeInTheDocument();

    // Ensure the search bar is present
    expect(screen.getByTestId("search-bar")).toBeInTheDocument();

    // Ensure the tab navigation is rendered
    expect(screen.getByTestId("tabs")).toBeInTheDocument();

    // Ensure ExamGrid is rendered with 4 exams
    expect(screen.getByTestId("exam-grid")).toHaveTextContent("4 exams");
  });

  test("changes the active tab when a tab button is clicked", () => {
    render(<BrowsePage />);

    // Click on "Popular" tab
    fireEvent.click(screen.getByText(/popular/i));

    // Ensure the heading updates correctly
    expect(screen.getByRole("heading", { name: /popular exams/i })).toBeInTheDocument();

    // Click on "Favorites" tab
    fireEvent.click(screen.getByText(/favorites/i));

    // Ensure the heading updates correctly
    expect(screen.getByRole("heading", { name: /my favorites/i })).toBeInTheDocument();
  });

  test("displays the correct number of exams in ExamGrid", () => {
    render(<BrowsePage />);

    // Ensure ExamGrid displays 4 exams
    expect(screen.getByTestId("exam-grid")).toHaveTextContent("4 exams");
  });
});
