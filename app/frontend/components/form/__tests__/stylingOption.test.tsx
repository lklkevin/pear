import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StylingOptions, colors, Color } from "../stylingOptions"; // adjust path if needed

describe("StylingOptions component", () => {
  const mockSetSelectedColor = jest.fn();
  const selectedColor: Color = "teal";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all color options", () => {
    render(
      <StylingOptions
        selectedColor={selectedColor}
        setSelectedColor={mockSetSelectedColor}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(colors.length);
  });

  test("highlights the selected color with ring class", () => {
    render(
      <StylingOptions
        selectedColor="blue"
        setSelectedColor={mockSetSelectedColor}
      />
    );

    const selected = screen
      .getAllByRole("button")
      .find((btn) => btn.className.includes("ring-2"));

    expect(selected).toHaveClass("ring-2");
    expect(selected?.className).toContain("ring-blue-300");
  });

  test("calls setSelectedColor when a color is clicked", () => {
    render(
      <StylingOptions
        selectedColor={selectedColor}
        setSelectedColor={mockSetSelectedColor}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]); // Clicking "blue" for example
    expect(mockSetSelectedColor).toHaveBeenCalledWith(colors[3].value);
  });
});
