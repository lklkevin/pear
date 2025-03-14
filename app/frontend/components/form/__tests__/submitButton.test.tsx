import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SubmitButton from "../submitButton";

describe("SubmitButton component", () => {
  test("renders button with provided text when not loading", () => {
    render(<SubmitButton text="Sign Up" loading={false} />);
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("renders the same text when loading is true", () => {
    render(<SubmitButton text="Sign Up" loading={true} />);
    // Expecting "Sign Up" because the component always renders the provided text.
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("disables the button when loading", () => {
    render(<SubmitButton text="Sign Up" loading={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("enables the button when loading is false", () => {
    render(<SubmitButton text="Sign Up" loading={false} />);
    expect(screen.getByRole("button")).toBeEnabled();
  });
});
