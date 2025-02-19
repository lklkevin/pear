import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SubmitButton from "../submitButton";

describe("SubmitButton component", () => {
  test("renders button with provided text", () => {
    render(<SubmitButton text="Sign Up" loading={false} />);

    // Ensure the button contains the correct text
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("displays loading text when loading is true", () => {
    render(<SubmitButton text="Sign Up" loading={true} />);

    // Ensure the button shows the loading state
    expect(screen.getByRole("button", { name: /signing up.../i })).toBeInTheDocument();
  });

  test("disables the button when loading", () => {
    render(<SubmitButton text="Sign Up" loading={true} />);

    // Ensure the button is disabled
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("enables the button when loading is false", () => {
    render(<SubmitButton text="Sign Up" loading={false} />);

    // Ensure the button is enabled
    expect(screen.getByRole("button")).toBeEnabled();
  });
});
