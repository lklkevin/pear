import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import InputField from "../inputField";

describe("InputField component", () => {
  test("renders input with label when provided", () => {
    render(<InputField label="Username" />);

    // Ensure the label is rendered and associated with the input
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  test("renders input with placeholder when provided", () => {
    render(<InputField placeholder="Enter your name" />);

    // Ensure the placeholder is displayed
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
  });

  test("renders input with default type as text", () => {
    render(<InputField />);

    // Ensure the input type is text
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  test("updates value on change", () => {
    const handleChange = jest.fn();
    render(<InputField label="Email" onChange={handleChange} />);

    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
