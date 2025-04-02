import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Counter from "../counter";

describe("Counter", () => {
  const setup = (props = {}) => {
    const onChange = jest.fn();
    render(<Counter value={5} onChange={onChange} {...props} />);
    const decrementButton = screen.getByRole("button", {
      name: /decrease value/i,
    });
    const incrementButton = screen.getByRole("button", {
      name: /increase value/i,
    });
    const input = screen.getByRole("spinbutton");
    return { decrementButton, incrementButton, input, onChange };
  };

  test("renders initial value", () => {
    const { input } = setup();
    expect(input).toHaveValue("5");
  });

  test("increments value", () => {
    const { incrementButton, onChange } = setup();
    fireEvent.click(incrementButton);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  test("decrements value", () => {
    const { decrementButton, onChange } = setup();
    fireEvent.click(decrementButton);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  test("does not decrement below min", () => {
    const { decrementButton, onChange } = setup({ value: 0, min: 0 });
    expect(decrementButton).toBeDisabled();
    fireEvent.click(decrementButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("does not increment above max", () => {
    const { incrementButton, onChange } = setup({ value: 10, max: 10 });
    expect(incrementButton).toBeDisabled();
    fireEvent.click(incrementButton);
    expect(onChange).not.toHaveBeenCalled();
  });

  test("allows manual numeric input", () => {
    const { input, onChange } = setup();
    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenCalledWith(7);
  });

  test("handles invalid input and resets on blur", () => {
    const { input, onChange } = setup({ value: 5, min: 1 });
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("1"); // resets to min
    expect(onChange).toHaveBeenCalledWith(1);
  });

  test("clamps input to max on blur", () => {
    const { input, onChange } = setup({ value: 5, min: 1, max: 10 });
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(10);
    expect(input).toHaveValue("10");
  });

  test("clamps input to min on blur", () => {
    const { input, onChange } = setup({ value: 5, min: 2 });
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(2);
    expect(input).toHaveValue("2");
  });
});
