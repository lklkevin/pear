import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PasswordField from "../passwordField";

describe("PasswordField component", () => {
  test("renders label text", () => {
    render(<PasswordField label="Password" value="" onChange={() => {}} />);
    // The label is rendered as text (but not associated with the input)
    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  test("calls onChange when typing in the input field", () => {
    const handleChange = jest.fn();
    render(<PasswordField label="Password" value="" onChange={handleChange} />);
    // Since the label isn't associated, query the input element directly
    const input = document.querySelector("input");
    expect(input).toBeInTheDocument();

    fireEvent.change(input!, { target: { value: "secret" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("toggles password visibility when clicking the toggle button", () => {
    render(<PasswordField label="Password" value="secret" onChange={() => {}} />);
    // Query the input directly
    const input = document.querySelector("input");
    expect(input).toHaveAttribute("type", "password");

    // There is no accessible label on the toggle button,
    // so we use getAllByRole to grab the button (only one button is rendered if showForgotPassword is false)
    const [toggleButton] = screen.getAllByRole("button");
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });
});
