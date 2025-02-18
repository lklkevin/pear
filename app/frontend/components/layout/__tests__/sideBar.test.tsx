// __tests__/Sidebar.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Sidebar from "../sideBar";

// Mock framer-motion animations to avoid delays in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Sidebar component", () => {
  test("renders collapsed sidebar and expands on click", () => {
    const setIsCollapsed = jest.fn();

    render(
      <Sidebar isCollapsed={true} setIsCollapsed={setIsCollapsed}>
        <p>Sidebar Content</p>
      </Sidebar>
    );

    // Ensure collapsed toggle button is visible
    expect(screen.getByText("keyboard_double_arrow_right")).toBeInTheDocument();

    // Click the toggle button to expand
    fireEvent.click(screen.getByText("keyboard_double_arrow_right"));
    expect(setIsCollapsed).toHaveBeenCalledWith(false);
  });

  test("renders expanded sidebar and collapses on click", () => {
    const setIsCollapsed = jest.fn();

    render(
      <Sidebar isCollapsed={false} setIsCollapsed={setIsCollapsed}>
        <p>Sidebar Content</p>
      </Sidebar>
    );

    // Ensure collapse button is visible
    expect(screen.getByText("Collapse")).toBeInTheDocument();

    // Click the collapse button
    fireEvent.click(screen.getByText("Collapse"));
    expect(setIsCollapsed).toHaveBeenCalledWith(true);
  });

  test("renders children content when expanded", () => {
    const setIsCollapsed = jest.fn();

    render(
      <Sidebar isCollapsed={false} setIsCollapsed={setIsCollapsed}>
        <p>Sidebar Content</p>
      </Sidebar>
    );

    expect(screen.getByText("Sidebar Content")).toBeInTheDocument();
  });
});

// jest.config.js
// Add this configuration to your jest.config.js or create it if it doesn't exist.
module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: ["**/__tests__/**/*.(ts|tsx)"],
};

// Installation commands (run these in your project root):
// npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest @types/jest
// npx jest
