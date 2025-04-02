import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VisibilityOption } from "../visibilityOption";

describe("VisibilityOption", () => {
  const defaultProps = {
    option: "public" as const,
    selected: false,
    label: "Public",
    subText: "Anyone can view this",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders label and subtext", () => {
    render(<VisibilityOption {...defaultProps} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
    expect(screen.getByText("Anyone can view this")).toBeInTheDocument();
  });

  test("calls onChange when clicked", () => {
    render(<VisibilityOption {...defaultProps} />);
    const radio = screen.getByRole("radio");
    fireEvent.click(radio);
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  test("shows selected styling and inner dot when selected", () => {
    render(<VisibilityOption {...defaultProps} selected={true} />);
    const radio = screen.getByRole("radio");

    expect(radio).toBeChecked();
    expect(screen.getByRole("radio")).toHaveStyle({
      backgroundColor: "rgb(16 185 129)",
    });
    expect(screen.getByText("Public").closest("label")).toHaveClass(
      "border-emerald-500"
    );
    expect(
      screen
        .getByText("Public")
        .closest("label")
        ?.querySelector("span.bg-white")
    ).toBeInTheDocument(); // the inner dot
  });

  test("shows default border when not selected", () => {
    render(<VisibilityOption {...defaultProps} />);
    const label = screen.getByText("Public").closest("label");
    expect(label).toHaveClass("border-zinc-800");
  });
});
