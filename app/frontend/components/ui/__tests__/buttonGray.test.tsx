import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "../buttonGray";

describe("ButtonGray component", () => {
  test("renders button with given text", () => {
    render(<Button text="Click Me" />);
    
    // Check if the button is in the document with the correct text
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("calls onClick function when clicked", () => {
    const onClickMock = jest.fn();
    render(<Button text="Click Me" onClick={onClickMock} />);
    
    const button = screen.getByRole("button", { name: /click me/i });

    fireEvent.click(button);
    
    // Ensure the onClick function was called
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClickMock = jest.fn();
    render(<Button text="Disabled" disabled onClick={onClickMock} />);
    
    const button = screen.getByRole("button", { name: /disabled/i });

    fireEvent.click(button);

    // Ensure the onClick function was NOT called
    expect(onClickMock).not.toHaveBeenCalled();
  });
});
