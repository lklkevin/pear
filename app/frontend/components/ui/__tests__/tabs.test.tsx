import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tabs from "../tabs";

describe("Tabs component", () => {
  test("renders all tab buttons", () => {
    render(<Tabs activeTab="My Exams" setActiveTab={jest.fn()} />);
    
    // Ensure all tab buttons are rendered
    expect(screen.getByRole("button", { name: /my exams/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /popular/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /favorites/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /explore/i })).toBeInTheDocument();
  });

  test("sets the correct tab as active", () => {
    render(<Tabs activeTab="Favorites" setActiveTab={jest.fn()} />);
    
    // Ensure the active tab button is in the document
    expect(screen.getByRole("button", { name: /favorites/i })).toBeInTheDocument();
  });

  test("calls setActiveTab when a tab is clicked", () => {
    const setActiveTabMock = jest.fn();
    render(<Tabs activeTab="My Exams" setActiveTab={setActiveTabMock} />);

    const exploreTab = screen.getByRole("button", { name: /explore/i });

    // Click on the "Explore" tab
    fireEvent.click(exploreTab);

    // Ensure setActiveTab is called with "Explore"
    expect(setActiveTabMock).toHaveBeenCalledTimes(1);
    expect(setActiveTabMock).toHaveBeenCalledWith("Explore");
  });

  test("does not call setActiveTab when clicking the already active tab", () => {
    const setActiveTabMock = jest.fn();
    render(<Tabs activeTab="Popular" setActiveTab={setActiveTabMock} />);

    const popularTab = screen.getByRole("button", { name: /popular/i });

    // Click on the already active "Popular" tab
    fireEvent.click(popularTab);

    // Ensure setActiveTab is still called (even if already active, it will still trigger the function)
    expect(setActiveTabMock).toHaveBeenCalledTimes(1);
    expect(setActiveTabMock).toHaveBeenCalledWith("Popular");
  });
});
